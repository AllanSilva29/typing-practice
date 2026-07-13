import * as vscode from 'vscode';
import { Snippet, getSnippets } from './snippetDatabase';
import { AISuggestionSuppressor } from './aiSuggestionSuppressor';
import { skipWhitespace } from './utils';
import { CodeExecutor } from './codeExecutor';
import { GameDecorator } from './gameDecorator';
import { writeTempFile, deleteTempFile, closeEditorIfOpen } from './handlers/fileHandler';
import { enforceCursorPosition } from './handlers/selectionHandler';

export class GameManager {
  private activeSnippet: Snippet | null = null;
  private currentUri: vscode.Uri | null = null;
  private currentIndex: number = 0;
  private errorIndex: number = -1;
  private history: number[] = [];
  
  private startTime: number = 0;
  private totalKeystrokes: number = 0;
  private correctKeystrokes: number = 0;
  
  private state: 'idle' | 'playing' | 'completed' = 'idle';
  private suppressor = new AISuggestionSuppressor();
  private executor = new CodeExecutor();
  private decorator = new GameDecorator();
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
  ) {
    this.onCompleteCallback = onComplete;
    this.onStopCallback = onStop;
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isCompleted(): boolean {
    return this.state === 'completed';
  }

  async start(snippet: Snippet) {
    if (this.state !== 'idle') {
      await this.stop(false);
    }

    this.initializeState(snippet);
    await this.suppressor.suppress();

    const editor = await this.prepareEditor(snippet);
    if (!editor) return;

    this.registerGameListeners(editor);
    this.refresh(editor);
    this.executor.showExplanation(snippet.id);

    const difficultyLabel = snippet.difficulty.toUpperCase();
    this.statusBarItem.text = `$(keyboard) Praticando: ${snippet.category} - ${snippet.id} (${difficultyLabel})`;
    this.statusBarItem.tooltip = `Prática de Digitação: ${snippet.comment}`;
    this.statusBarItem.show();
  }

  private initializeState(snippet: Snippet) {
    this.activeSnippet = snippet;
    this.state = 'playing';
    this.currentIndex = 0;
    this.errorIndex = -1;
    this.history = [];
    this.startTime = Date.now();
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
  }

  private async prepareEditor(snippet: Snippet): Promise<vscode.TextEditor | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Abra uma pasta no VS Code para iniciar a prática.');
      this.state = 'idle';
      return null;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const normalizedCode = snippet.code.replace(/\r\n/g, '\n');
    this.activeSnippet!.code = normalizedCode;

    this.currentIndex = skipWhitespace(normalizedCode, this.currentIndex);

    const fileUri = await writeTempFile(rootPath, snippet.language, normalizedCode);
    this.currentUri = fileUri;

    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One, false);

    return editor;
  }

  private registerGameListeners(editor: vscode.TextEditor) {
    const selSub = vscode.window.onDidChangeTextEditorSelection((e) => {
      if (this.state !== 'playing') return;
      enforceCursorPosition(e, this.currentUri, this.currentIndex, this.errorIndex, this.activeSnippet!.code);
    });

    this.disposables.push(selSub);
  }

  async handleType(character: string) {
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

    this.totalKeystrokes++;

    const isCorrectChar = character === targetChar || (targetChar === '\n' && character === '\n');
    const isError = this.errorIndex !== -1 || !isCorrectChar;

    if (isError) {
      this.errorIndex = this.errorIndex === -1 ? this.currentIndex : this.errorIndex;
      this.refresh(editor);
      return;
    }

    this.correctKeystrokes++;
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

  async handleBackspace() {
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

    if (this.errorIndex !== -1) {
      this.errorIndex = -1;
      this.refresh(editor);
      return;
    }

    this.currentIndex = this.history.pop() ?? this.currentIndex;

    this.refresh(editor);
  }

  private refresh(editor: vscode.TextEditor) {
    const code = this.activeSnippet!.code;
    this.decorator.update(editor, code, this.currentIndex, this.errorIndex);
    this.decorator.syncCursor(editor, code, this.currentIndex, this.errorIndex);
  }

  private async completeGame() {
    const { ppm, accuracy } = this.calculateMetrics();
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

  private async navigateToNextOrPrev(isNext: boolean) {
    if (!this.activeSnippet) return;

    const snippets = getSnippets();
    const currentIndex = snippets.findIndex(s => s.id === this.activeSnippet!.id);
    if (currentIndex === -1) return;

    let targetSnippet: Snippet;
    if (isNext) {
      targetSnippet = snippets[(currentIndex + 1) % snippets.length];
    } else {
      targetSnippet = snippets[(currentIndex - 1 + snippets.length) % snippets.length];
    }

    const tempUri = this.currentUri;
    this.state = 'idle';
    if (tempUri) {
      await closeEditorIfOpen(tempUri);
      await deleteTempFile(tempUri);
      this.currentUri = null;
    }
    this.activeSnippet = null;

    await this.start(targetSnippet);
  }

  private calculateMetrics(): { ppm: number; accuracy: number } {
    const durationMs = Date.now() - this.startTime;
    const minutes = durationMs / 60000;
    
    const ppm = minutes > 0 ? Math.round((this.correctKeystrokes / 5) / minutes) : 0;
    const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;

    return { ppm, accuracy };
  }

  async stop(completed: boolean = false) {
    if (this.state === 'idle') return;

    this.state = 'idle';
    
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];

    await this.suppressor.restore();

    if (this.currentUri) {
      await closeEditorIfOpen(this.currentUri);
      await deleteTempFile(this.currentUri);
      this.currentUri = null;
    }

    this.activeSnippet = null;

    this.statusBarItem.hide();

    if (!completed && this.onStopCallback) {
      this.onStopCallback();
    }
  }

  async fallbackBackspace() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    if (selection.isEmpty) {
      const position = selection.active;
      if (position.character > 0) {
        const range = new vscode.Range(position.translate(0, -1), position);
        await editor.edit(editBuilder => {
          editBuilder.delete(range);
        });
      } else if (position.line > 0) {
        const previousLineLength = editor.document.lineAt(position.line - 1).text.length;
        const range = new vscode.Range(
          new vscode.Position(position.line - 1, previousLineLength),
          position
        );
        await editor.edit(editBuilder => {
          editBuilder.delete(range);
        });
      }
    } else {
      await editor.edit(editBuilder => {
        editBuilder.delete(selection);
      });
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}


