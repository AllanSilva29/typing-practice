import * as vscode from 'vscode';
import { Snippet, SnippetService } from './services/snippetService';
import { AISuggestionService } from './services/aiSuggestionService';
import { skipWhitespace, ACCENT_MAP } from './utils';
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

  private state: 'idle' | 'playing' | 'completed' = 'idle';
  private suppressor = new AISuggestionService();
  private executor = new CodeExecutionService();
  private decorator = new GameDecoratorService();
  private metrics = new MetricsTrackerService();
  private disposables: vscode.Disposable[] = [];
  private statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  private onCompleteCallback?: (stats: { ppm: number; accuracy: number; snippetId: string }) => void;
  private onStopCallback?: () => void;

  registerCallbacks(
    onComplete: (stats: { ppm: number; accuracy: number; snippetId: string }) => void,
    onStop: () => void
  ): void {
    this.onCompleteCallback = onComplete;
    this.onStopCallback = onStop;
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isCompleted(): boolean {
    return this.state === 'completed';
  }

  async start(snippet: Snippet): Promise<void> {
    if (this.state !== 'idle') {
      await this.stop(false);
    }

    this.initializeState(snippet);
    await this.suppressor.suppress();

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
    this.statusBarItem.text = `$(keyboard) Praticando: ${snippet.name} (${difficultyLabel})`;
    this.statusBarItem.tooltip = `Prática de Digitação: ${snippet.comment}`;
    this.statusBarItem.show();
  }

  private initializeState(snippet: Snippet): void {
    this.activeSnippet = snippet;
    this.state = 'playing';
    this.currentIndex = 0;
    this.errorIndex = -1;
    this.history = [];
    this.pendingAccent = null;
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
    });

    const activeEditorSub = vscode.window.onDidChangeActiveTextEditor((activeEditor) => {
      if (this.state === 'playing' && activeEditor && this.currentUri && activeEditor.document.uri.toString() === this.currentUri.toString()) {
        this.refresh(activeEditor);
      }
    });

    const docChangeSub = vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (this.state === 'playing' && this.currentUri && e.document.uri.toString() === this.currentUri.toString()) {
        await vscode.commands.executeCommand('undo');
      }
    });

    this.disposables.push(selSub, activeEditorSub, docChangeSub);
  }

  async handleType(character: string): Promise<void> {
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

    const code = this.activeSnippet.code;
    const targetChar = code[this.currentIndex];

    let isCorrectChar = false;

    // Se houver acento pendente
    if (this.pendingAccent !== null) {
      const composition = ACCENT_MAP[targetChar];
      if (composition && composition.accents.includes(this.pendingAccent) && character === composition.base) {
        isCorrectChar = true;
      }
      this.pendingAccent = null;
    } else {
      // Se não houver acento pendente, verifica se o caractere digitado é o caractere alvo diretamente
      if (character === targetChar || (targetChar === '\n' && character === '\n')) {
        isCorrectChar = true;
      } else {
        // Se não for correto, verifica se o caractere alvo aceita composição e o caractere digitado é um dos acentos válidos
        const composition = ACCENT_MAP[targetChar];
        if (composition && composition.accents.includes(character)) {
          this.pendingAccent = character;
          // Retorna sem erro e sem avançar, aguardando o próximo caractere (a base)
          return;
        }
      }
    }

    this.metrics.recordKeystroke(isCorrectChar);

    const isError = this.errorIndex !== -1 || !isCorrectChar;
    if (isError) {
      this.errorIndex = this.errorIndex === -1 ? this.currentIndex : this.errorIndex;
      this.refresh(editor);
      return;
    }

    this.history.push(this.currentIndex);
    this.currentIndex++;

    if (this.currentIndex > 0 && code[this.currentIndex - 1] === '\n') {
      this.currentIndex = skipWhitespace(code, this.currentIndex);
    }

    if (this.currentIndex >= code.length) {
      await this.completeGame();
      return;
    }

    this.refresh(editor);
  }

  async handleBackspace(): Promise<void> {
    if (this.state === 'completed') {
      await this.navigateToNextOrPrev(false);
      return;
    }

    if (this.state !== 'playing' || !this.activeSnippet || !this.currentUri) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== this.currentUri.toString()) {
      await vscode.commands.executeCommand('default:deleteLeft');
      return;
    }

    if (this.pendingAccent !== null) {
      this.pendingAccent = null;
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
    this.decorator.update(editor, code, this.currentIndex, this.errorIndex);
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
      this.onCompleteCallback({ ppm, accuracy, snippetId });
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

    await this.start(targetSnippet);
  }

  async stop(completed: boolean = false): Promise<void> {
    if (this.state === 'idle') return;

    this.state = 'idle';
    this.pendingAccent = null;

    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];

    await this.suppressor.restore();

    if (this.currentUri) {
      await FileHandler.closeEditorIfOpen(this.currentUri);
      await FileHandler.deleteTempFile(this.currentUri);
      this.currentUri = null;
    }

    this.activeSnippet = null;
    this.statusBarItem.hide();

    if (!completed && this.onStopCallback) {
      this.onStopCallback();
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
