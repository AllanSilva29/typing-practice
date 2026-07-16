import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Snippet, SnippetService } from '../core/services/snippetService';
import { GameManager } from '../core/gameManager';
import { ProgressService } from '../core/services/progressService';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'typingPractice.sidebar';
  private _view?: vscode.WebviewView;
  private currentMode: 'standard' | 'auto' = 'standard';

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
    private readonly _gameManager: GameManager
  ) {
    this._gameManager.registerCallbacks(
      (stats, mode) => this.handleGameComplete(stats, mode),
      () => this.handleGameStop()
    );
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    const cssPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css');
    const cssUri = webviewView.webview.asWebviewUri(cssPath);

    const jsPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js');
    const jsUri = webviewView.webview.asWebviewUri(jsPath);

    const htmlFilePath = path.join(this._extensionUri.fsPath, 'media', 'sidebar.html');
    try {
      let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      htmlContent = htmlContent
        .replace('{{cssUri}}', cssUri.toString())
        .replace('{{jsUri}}', jsUri.toString());
      
      webviewView.webview.html = htmlContent;
    } catch (err: any) {
      webviewView.webview.html = `<h1>Erro ao carregar layout da extensão</h1><p>${err.message}</p>`;
    }

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'modeChanged': {
          this.currentMode = data.mode;
          this.sendStateToWebview(this.currentMode);
          break;
        }
        case 'startPractice': {
          const { language, difficulty } = data.filters;
          const snippet = this.getRandomSnippet(language, difficulty);
          if (!snippet) {
            vscode.window.showWarningMessage('Nenhum snippet correspondente aos filtros foi encontrado.');
            break;
          }
          await this._gameManager.start(snippet, this.currentMode);
          this.sendStateToWebview(this.currentMode);
          break;
        }
        case 'stopPractice': {
          await this._gameManager.stop(false);
          this.sendStateToWebview(this.currentMode);
          break;
        }
        case 'resetProgress': {
          const confirm = await vscode.window.showWarningMessage(
            'Tem certeza de que deseja resetar todo o seu progresso de digitação?',
            { modal: true },
            'Sim, resetar'
          );
          if (confirm !== 'Sim, resetar') break;
          
          await ProgressService.getInstance().clearProgress(this.currentMode);
          this.sendStateToWebview(this.currentMode);
          vscode.window.showInformationMessage('Progresso de digitação resetado com sucesso.');
          break;
        }
        case 'revisitSnippet': {
          const snippet = SnippetService.getInstance().findSnippetById(data.snippetId);
          if (!snippet) {
            vscode.window.showErrorMessage('Snippet não encontrado no banco de dados.');
            break;
          }
          await this._gameManager.start(snippet, this.currentMode);
          this.sendStateToWebview(this.currentMode);
          break;
        }
        case 'openFolderMetadata': {
          const { relativePath } = data;
          await this.openFolderMetadataMarkdown(relativePath);
          break;
        }
      }
    });

    this.sendStateToWebview(this.currentMode);
  }

  private async openFolderMetadataMarkdown(relativePath: string): Promise<void> {
    const exercisesPath = path.join(this._context.extensionPath, 'exercises');
    const folderPath = path.join(exercisesPath, relativePath);
    const metadataFile = path.join(folderPath, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      vscode.window.showWarningMessage(`Nenhum arquivo metadata.json encontrado em: ${relativePath || 'exercises'}`);
      return;
    }

    try {
      const uri = vscode.Uri.parse(`typing-practice-metadata:/${relativePath}`);
      await vscode.commands.executeCommand('markdown.showPreview', uri);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Erro ao abrir metadata da pasta: ${err.message}`);
    }
  }

  private getRandomSnippet(language: string, difficulty: string): Snippet | null {
    const filtered = SnippetService.getInstance().getSnippets().filter((s) => 
      (language === 'all' || s.language.toLowerCase() === language.toLowerCase()) &&
      (difficulty === 'all' || s.difficulty.toLowerCase() === difficulty.toLowerCase())
    );

    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  private async handleGameComplete(
    stats: { ppm: number; accuracy: number; snippetId: string },
    mode: 'standard' | 'auto'
  ): Promise<void> {
    await ProgressService.getInstance().addRecord(stats, mode);
    vscode.window.showInformationMessage(`Snippet concluído! PPM: ${stats.ppm} | Precisão: ${stats.accuracy}%`);
    this.sendStateToWebview(this.currentMode);
  }

  private handleGameStop(): void {
    this.sendStateToWebview(this.currentMode);
  }

  private sendStateToWebview(mode: 'standard' | 'auto' = 'standard'): void {
    if (!this._view) return;
    const isPlaying = this._gameManager.isPlaying;
    const progressState = ProgressService.getInstance().getProgressState(isPlaying, mode);
    this._view.webview.postMessage({
      type: 'updateState',
      ...progressState,
      snippets: SnippetService.getInstance().getSnippets()
    });
  }
}
