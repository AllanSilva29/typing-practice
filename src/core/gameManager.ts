import * as vscode from 'vscode';
import { Snippet, SnippetService } from './services/snippetService';
import { AISuggestionService } from './services/aiSuggestionService';
import { skipWhitespace, ACCENT_MAP, isDoubleTrigger, positionAt, getCommentPrefix, getLevenshteinDistance, cleanUserText } from './utils';
import { CodeExecutionService } from './services/codeExecutionService';
import { GameDecoratorService } from './services/gameDecoratorService';
import { FileHandler } from './handlers/fileHandler';
import { SelectionHandler } from './handlers/selectionHandler';
import { MetricsTrackerService } from './services/metricsTrackerService';

export class GameManager {
  private activeSnippet: Snippet | null = null;
  private currentUri: vscode.Uri | null = null;
  private currentIndex: number = 0;
  private errorIndex: number = -1;
  private history: number[] = [];
  private pendingAccent: string | null = null;
  private lastCorrectChar: string = '';
  private lastCorrectTime: number = 0;
  private lastCorrectSource: 'type' | 'composition' | null = null;
  private isResettingDocument: boolean = false;

  private state: 'idle' | 'playing' | 'completed' | 'user_turn' = 'idle';
  private mode: 'standard' | 'auto' = 'standard';
  private isAutoTyping: boolean = false;
  private userTurnStartTime: number = 0;
  private tempFilesToCleanup: vscode.Uri[] = [];

  private suppressor = new AISuggestionService();
  private executor = new CodeExecutionService();
  private decorator = new GameDecoratorService();
  private metrics = new MetricsTrackerService();
  private disposables: vscode.Disposable[] = [];
  private statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  private explanationStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    99
  );

  private onCompleteCallback?: (stats: { ppm: number; accuracy: number; snippetId: string }, mode: 'standard' | 'auto') => void;
  private onStopCallback?: () => void;
  private onComboCallback?: (combo: number) => void;
  private comboCount: number = 0;

  registerCallbacks(
    onComplete: (stats: { ppm: number; accuracy: number; snippetId: string }, mode: 'standard' | 'auto') => void,
    onStop: () => void,
    onCombo?: (combo: number) => void
  ): void {
    this.onCompleteCallback = onComplete;
    this.onStopCallback = onStop;
    this.onComboCallback = onCombo;
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isCompleted(): boolean {
    return this.state === 'completed';
  }

  get currentPracticeUri(): vscode.Uri | null {
    return this.currentUri;
  }

  get currentSnippet(): Snippet | null {
    return this.activeSnippet;
  }

  async start(snippet: Snippet, mode: 'standard' | 'auto' = 'standard'): Promise<void> {
    if (this.state !== 'idle') {
      await this.stop(false);
    }

    this.mode = mode;
    this.initializeState(snippet);
    await this.suppressor.suppress();
    await this.cleanupTempFiles();

    try {
      const uri = vscode.Uri.parse(`typing-practice-metadata:/${snippet.language}/${snippet.relativePath}`);
      await vscode.commands.executeCommand('markdown.showPreview', uri, vscode.ViewColumn.Two);
    } catch {
    }

    const editor = await this.prepareEditor(snippet);
    if (!editor) return;

    this.registerGameListeners(editor);
    this.refresh(editor);
    this.executor.showExplanation(snippet.id);

    const difficultyLabel = snippet.difficulty.toUpperCase();
    if (this.mode === 'auto') {
      this.statusBarItem.text = `$(sync~spin) Auto-digitando: ${snippet.name} (${difficultyLabel})`;
    } else {
      this.statusBarItem.text = `$(keyboard) Praticando: ${snippet.name} (${difficultyLabel})`;
    }
    this.statusBarItem.tooltip = `Prática de Digitação: ${snippet.comment}`;
    this.statusBarItem.show();

    if (this.mode === 'auto') {
      this.runAutoTyping(editor, snippet);
    }
  }

  private initializeState(snippet: Snippet): void {
    this.activeSnippet = snippet;
    this.state = 'playing';
    this.currentIndex = 0;
    this.errorIndex = -1;
    this.history = [];
    this.pendingAccent = null;
    this.lastCorrectChar = '';
    this.lastCorrectTime = Date.now();
    this.lastCorrectSource = null;
    this.isResettingDocument = false;
    this.isAutoTyping = false;
    this.userTurnStartTime = 0;
    this.comboCount = 0;
    this.explanationStatusBarItem.hide();
    this.metrics.start();
  }

  private async prepareEditor(snippet: Snippet): Promise<vscode.TextEditor | null> {
    const result = await FileHandler.setupPracticeDocument(snippet);
    if (!result) {
      this.state = 'idle';
      return null;
    }

    this.currentUri = result.uri;
    this.currentIndex = skipWhitespace(snippet.code, this.currentIndex);
    return result.editor;
  }

  private registerGameListeners(editor: vscode.TextEditor): void {
    const selSub = vscode.window.onDidChangeTextEditorSelection((e) => {
      if (this.state !== 'playing') return;
      SelectionHandler.enforceCursorPosition(e, this.currentUri, this.currentIndex, this.errorIndex, this.activeSnippet!.code);

      const lineNum = e.selections[0].active.line + 1;
      const explanation = this.activeSnippet?.lineExplanations?.[lineNum];
      if (explanation) {
        const truncated = explanation.length > 50 ? explanation.substring(0, 47) + '...' : explanation;
        this.explanationStatusBarItem.text = `$(info) Linha ${lineNum}: ${truncated}`;
        this.explanationStatusBarItem.tooltip = `Linha ${lineNum}: ${explanation}\n\nClique para abrir em janela pop-up.`;
        this.explanationStatusBarItem.command = {
          title: 'Mostrar Detalhes da Linha',
          command: 'typingPractice.showExplanationDetails',
          arguments: [lineNum, explanation]
        };
        this.explanationStatusBarItem.show();
      } else {
        this.explanationStatusBarItem.hide();
      }
    });

    const activeEditorSub = vscode.window.onDidChangeActiveTextEditor((activeEditor) => {
      if (this.state === 'playing' && activeEditor && this.currentUri && activeEditor.document.uri.toString() === this.currentUri.toString()) {
        this.refresh(activeEditor);
      }
    });

    const docChangeSub = vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (this.state !== 'playing' || !this.currentUri || e.document.uri.toString() !== this.currentUri.toString()) {
        return;
      }
      if (this.isResettingDocument) return;

      if (e.contentChanges.length === 0) return;

      const change = e.contentChanges[0];
      const insertedText = change.text;

      if (!insertedText) {
        await this.resetDocumentText();
        return;
      }

      await this.handleCompositionType(insertedText);
    });

    const saveSub = vscode.workspace.onDidSaveTextDocument(async (doc) => {
      if (this.state === 'user_turn' && this.currentUri && doc.uri.toString() === this.currentUri.toString()) {
        await this.completeUserTurn(doc.getText());
      }
    });

    this.disposables.push(selSub, activeEditorSub, docChangeSub, saveSub);
  }

  async handleType(character: string): Promise<void> {
    if (this.isAutoTyping) {
      if (character === '\n') {
        this.isAutoTyping = false;
      }
      return;
    }

    if (this.state === 'completed') {
      if (character === '\n') {
        await this.navigateToNextOrPrev(true);
        return;
      }
      await vscode.commands.executeCommand('default:type', { text: character });
      return;
    }

    if (this.state !== 'playing' || !this.activeSnippet || !this.currentUri) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== this.currentUri.toString()) {
      await vscode.commands.executeCommand('default:type', { text: character });
      return;
    }

    // Evita processamento duplo se o mesmo caractere já foi tratado pela composição recentemente
    if (
      Date.now() - this.lastCorrectTime < 100 &&
      this.lastCorrectSource === 'composition' &&
      isDoubleTrigger(this.lastCorrectChar, character)
    ) {
      return;
    }

    const code = this.activeSnippet.code;
    const targetChar = code[this.currentIndex];

    this.statusBarItem.text = `Digitado: "${character}" | Esperado: "${targetChar}" | Acento: "${this.pendingAccent}"`;

    let isCorrectChar = false;

    // Verifica se o caractere digitado é o caractere alvo diretamente (cobre composição concluída pelo SO)
    if (character === targetChar || (targetChar === '\n' && character === '\n')) {
      isCorrectChar = true;
      this.pendingAccent = null;
    } else if (this.pendingAccent !== null) {
      // Se houver acento pendente e o SO não tiver feito a composição (envia caractere base isolado)
      const composition = ACCENT_MAP[targetChar];
      if (composition && composition.accents.includes(this.pendingAccent) && character === composition.base) {
        isCorrectChar = true;
      }
      this.pendingAccent = null;
    } else {
      // Se não houver acento pendente e o caractere não for o alvo, verifica se é um acento válido para a composição
      const composition = ACCENT_MAP[targetChar];
      if (composition && composition.accents.includes(character)) {
        this.pendingAccent = character;
        // Retorna sem erro e sem avançar, aguardando o próximo caractere (a base ou a composição concluída)
        return;
      }
    }

    this.metrics.recordKeystroke(isCorrectChar);

    const isError = this.errorIndex !== -1 || !isCorrectChar;
    if (isError) {
      this.comboCount = 0;
      this.errorIndex = this.errorIndex === -1 ? this.currentIndex : this.errorIndex;
      this.refresh(editor);
      return;
    }

    if (isCorrectChar) {
      this.lastCorrectChar = character;
      this.lastCorrectTime = Date.now();
      this.lastCorrectSource = 'type';

      const prevChar = this.currentIndex > 0 ? code[this.currentIndex - 1] : '';
      const isWordEnd = (/[a-zA-Z0-9_$]/.test(prevChar) && /[\s;,.()\[\]{}:"']/.test(targetChar)) || this.currentIndex === code.length - 1;
      if (isWordEnd) {
        this.comboCount++;
        if (this.onComboCallback) {
          this.onComboCallback(this.comboCount);
        }
      }
    }

    this.history.push(this.currentIndex);
    this.currentIndex++;

    if (this.currentIndex > 0 && code[this.currentIndex - 1] === '\n') {
      this.currentIndex = skipWhitespace(code, this.currentIndex);
    }

    if (this.currentIndex >= code.length) {
      if (this.mode === 'auto') {
        this.isAutoTyping = false;
        await this.startUserTurn(this.activeSnippet!);
      } else {
        await this.completeGame();
      }
      return;
    }

    this.refresh(editor);
  }

  private async resetDocumentText(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.currentUri || !this.activeSnippet) return;

    this.isResettingDocument = true;
    try {
      const document = editor.document;
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );
      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, this.activeSnippet!.code);
      }, { undoStopBefore: false, undoStopAfter: false });
    } finally {
      this.isResettingDocument = false;
    }
    this.refresh(editor);
  }

  private async handleCompositionType(text: string): Promise<void> {
    if (this.isAutoTyping) return;
    if (this.state !== 'playing' || !this.activeSnippet || !this.currentUri) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== this.currentUri.toString()) {
      return;
    }

    // Evita processamento duplo se o mesmo caractere já foi tratado pelo comando type recentemente
    if (
      Date.now() - this.lastCorrectTime < 100 &&
      this.lastCorrectSource === 'type' &&
      isDoubleTrigger(this.lastCorrectChar, text)
    ) {
      await this.resetDocumentText();
      return;
    }

    const code = this.activeSnippet.code;
    const targetChar = code[this.currentIndex];

    this.statusBarItem.text = `Comp: "${text}" | Esperado: "${targetChar}" | Acento: "${this.pendingAccent}"`;

    const isCorrect = text === targetChar;

    if (isCorrect) {
      await this.resetDocumentText();

      this.lastCorrectChar = text;
      this.lastCorrectTime = Date.now();
      this.lastCorrectSource = 'composition';

      this.pendingAccent = null;
      this.metrics.recordKeystroke(true);

      this.history.push(this.currentIndex);
      this.currentIndex++;

      if (this.currentIndex > 0 && code[this.currentIndex - 1] === '\n') {
        this.currentIndex = skipWhitespace(code, this.currentIndex);
      }

      if (this.currentIndex >= code.length) {
        if (this.mode === 'auto') {
          this.isAutoTyping = false;
          await this.startUserTurn(this.activeSnippet!);
        } else {
          await this.completeGame();
        }
        return;
      }

      this.refresh(editor);
    } else {
      const composition = ACCENT_MAP[targetChar];
      if (composition && composition.accents.includes(text)) {
        this.pendingAccent = text;
        return;
      }

      await this.resetDocumentText();

      this.metrics.recordKeystroke(false);
      this.errorIndex = this.errorIndex === -1 ? this.currentIndex : this.errorIndex;
      this.refresh(editor);
    }
  }

  async handleBackspace(): Promise<void> {
    if (this.isAutoTyping) return;

    if (this.state === 'completed') {
      await this.navigateToNextOrPrev(false);
      return;
    }

    if (this.state !== 'playing' || !this.activeSnippet || !this.currentUri) return;

    this.comboCount = 0;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== this.currentUri.toString()) {
      await vscode.commands.executeCommand('default:deleteLeft');
      return;
    }

    if (this.pendingAccent !== null) {
      this.pendingAccent = null;
      await this.resetDocumentText();
      this.refresh(editor);
      return;
    }

    if (this.errorIndex !== -1) {
      this.errorIndex = -1;
      this.refresh(editor);
      return;
    }

    this.currentIndex = this.history.pop() ?? this.currentIndex;
    this.refresh(editor);
  }

  private refresh(editor: vscode.TextEditor): void {
    const code = this.activeSnippet!.code;
    this.decorator.update(editor, code, this.currentIndex, this.errorIndex, this.activeSnippet?.lineExplanations);
    this.decorator.syncCursor(editor, code, this.currentIndex, this.errorIndex);
  }

  private async completeGame(): Promise<void> {
    const { ppm, accuracy } = this.metrics.calculate();
    const snippetId = this.activeSnippet!.id;

    this.state = 'completed';

    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    await this.suppressor.restore();

    const editor = vscode.window.activeTextEditor;
    if (editor && this.currentUri && editor.document.uri.toString() === this.currentUri.toString()) {
      this.decorator.clear(editor);
    }

    this.executor.execute('', '', snippetId);

    if (this.onCompleteCallback) {
      this.onCompleteCallback({ ppm, accuracy, snippetId }, 'standard');
    }
  }

  private async navigateToNextOrPrev(isNext: boolean): Promise<void> {
    if (!this.activeSnippet) return;

    const snippets = SnippetService.getInstance().getSnippets();
    const currentIndex = snippets.findIndex(s => s.id === this.activeSnippet!.id);
    if (currentIndex === -1) return;

    const targetSnippet = isNext
      ? snippets[(currentIndex + 1) % snippets.length]
      : snippets[(currentIndex - 1 + snippets.length) % snippets.length];

    const tempUri = this.currentUri;
    this.state = 'idle';
    if (tempUri) {
      await FileHandler.closeEditorIfOpen(tempUri);
      await FileHandler.deleteTempFile(tempUri);
      this.currentUri = null;
    }
    this.activeSnippet = null;

    await this.start(targetSnippet, this.mode);
  }

  async stop(completed: boolean = false): Promise<void> {
    if (this.state === 'idle') return;

    this.state = 'idle';
    this.pendingAccent = null;
    this.lastCorrectChar = '';
    this.lastCorrectTime = 0;
    this.lastCorrectSource = null;
    this.isAutoTyping = false;

    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];

    await this.suppressor.restore();

    if (this.currentUri) {
      await FileHandler.closeEditorIfOpen(this.currentUri);
      await FileHandler.deleteTempFile(this.currentUri);
      this.currentUri = null;
    }

    await this.cleanupTempFiles();

    this.activeSnippet = null;
    this.statusBarItem.hide();
    this.explanationStatusBarItem.hide();

    if (!completed && this.onStopCallback) {
      this.onStopCallback();
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
    this.explanationStatusBarItem.dispose();
  }

  private async waitWithSkip(ms: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < ms && this.isAutoTyping) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  private async runAutoTyping(editor: vscode.TextEditor, snippet: Snippet): Promise<void> {
    this.isAutoTyping = true;
    const code = snippet.code;

    await this.waitWithSkip(800);

    while (this.state === 'playing' && this.isAutoTyping && this.currentIndex < code.length) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || !this.currentUri || activeEditor.document.uri.toString() !== this.currentUri.toString()) {
        await this.waitWithSkip(200);
        continue;
      }

      const char = code[this.currentIndex];
      await this.handleTypeInternal(char);

      if (this.currentIndex >= code.length) {
        break;
      }

      const nextChar = code[this.currentIndex] || '';
      const delay = this.getAutoTypingDelay(char, nextChar);
      await this.waitWithSkip(delay);
    }

    this.isAutoTyping = false;

    if (this.state === 'playing' && this.mode === 'auto') {
      await this.startUserTurn(snippet);
    }
  }

  private async handleTypeInternal(character: string): Promise<void> {
    const code = this.activeSnippet!.code;
    const targetChar = code[this.currentIndex];

    let isCorrectChar = character === targetChar || (targetChar === '\n' && character === '\n');
    this.metrics.recordKeystroke(isCorrectChar);

    if (!isCorrectChar) return;

    this.lastCorrectChar = character;
    this.lastCorrectTime = Date.now();
    this.lastCorrectSource = 'type';

    this.history.push(this.currentIndex);
    this.currentIndex++;

    if (this.currentIndex > 0 && code[this.currentIndex - 1] === '\n') {
      this.currentIndex = skipWhitespace(code, this.currentIndex);
    }

    const editor = vscode.window.activeTextEditor;
    if (editor && this.currentUri && editor.document.uri.toString() === this.currentUri.toString()) {
      this.refresh(editor);
    }
  }

  private getAutoTypingDelay(char: string, nextChar: string): number {
    const isWordBoundary = (c: string) => /[\s\.,;:\(\)\{\}\[\]]/.test(c);
    if (isWordBoundary(char) && !isWordBoundary(nextChar)) {
      return 250 + Math.random() * 350;
    }
    return 45 + Math.random() * 45;
  }

  private async startUserTurn(snippet: Snippet): Promise<void> {
    this.state = 'user_turn';
    this.userTurnStartTime = Date.now();

    if (this.currentUri) {
      await FileHandler.closeEditorIfOpen(this.currentUri);
      await FileHandler.deleteTempFile(this.currentUri);
      this.currentUri = null;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.state = 'idle';
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const initialText = "";

    const fileUri = await FileHandler.writeTempFile(rootPath, snippet.language, initialText);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One, false);

    this.currentUri = fileUri;

    const endPosition = new vscode.Position(0, 0);
    editor.selection = new vscode.Selection(endPosition, endPosition);

    this.statusBarItem.text = `$(edit) Deixa que eu faço: Agora é sua vez.`;
    this.statusBarItem.tooltip = `Agora é sua vez! Digite o código correspondente de cabeça e salve o arquivo (Ctrl+S) para ver o diff.`;
    this.statusBarItem.show();

    this.explanationStatusBarItem.text = `$(info) Agora é sua vez.`;
    this.explanationStatusBarItem.tooltip = `Digite o código correspondente de cabeça e salve o arquivo (Ctrl+S) para ver o diff.`;
    this.explanationStatusBarItem.show();

    vscode.window.showInformationMessage('Agora sua vez! Digite o exercício de cabeça e salve o arquivo para finalizar.');
  }

  private async completeUserTurn(userText: string): Promise<void> {
    const snippet = this.activeSnippet!;
    const commentPrefix = getCommentPrefix(snippet.language);
    const cleanedUser = cleanUserText(userText, commentPrefix);
    const expected = snippet.code.trim();

    const dist = getLevenshteinDistance(expected, cleanedUser);
    const maxLen = Math.max(expected.length, cleanedUser.length);
    const accuracy = maxLen > 0 ? Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100)) : 100;

    const timeInMs = Date.now() - this.userTurnStartTime;
    const timeInMins = timeInMs / 60000;
    const ppm = timeInMins > 0 ? Math.round((cleanedUser.length / 5) / timeInMins) : 0;

    const userUri = this.currentUri!;
    this.tempFilesToCleanup.push(userUri);

    await FileHandler.closeEditorIfOpen(userUri);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const expectedUri = await FileHandler.writeTempFile(rootPath, snippet.language, expected);
      this.tempFilesToCleanup.push(expectedUri);

      const title = `${snippet.name} (Gabarito vs Seu Código)`;
      await vscode.commands.executeCommand('vscode.diff', expectedUri, userUri, title);
    }

    this.state = 'completed';
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    await this.suppressor.restore();
    this.statusBarItem.hide();
    this.explanationStatusBarItem.hide();

    if (accuracy >= 80) {
      if (this.onCompleteCallback) {
        this.onCompleteCallback({ ppm, accuracy, snippetId: snippet.id }, 'auto');
      }
    } else {
      vscode.window.showWarningMessage(`Exercício não concluído. Precisão mínima de 80% requerida (você obteve ${accuracy}%). Tente novamente!`);
      if (this.onStopCallback) {
        this.onStopCallback();
      }
    }
  }

  private async cleanupTempFiles(): Promise<void> {
    for (const uri of this.tempFilesToCleanup) {
      try {
        await FileHandler.deleteTempFile(uri);
      } catch {}
    }
    this.tempFilesToCleanup = [];
  }
}
