import * as vscode from 'vscode';
import { GameManager } from './core/gameManager';
import { SidebarProvider } from './views/sidebarProvider';
import { SnippetService } from './core/services/snippetService';
import { MetadataContentProvider } from './core/metadataContentProvider';
import { CommandHandler } from './core/handlers/commandHandler';
import { ProgressService } from './core/services/progressService';

let gameManager: GameManager;

export function activate(context: vscode.ExtensionContext): void {
  SnippetService.getInstance().loadExercises(context.extensionPath);
  ProgressService.initialize(context);

  gameManager = new GameManager();
  CommandHandler.register(context, gameManager);

  const metadataProvider = new MetadataContentProvider(context.extensionPath);
  const sidebarProvider = new SidebarProvider(context.extensionUri, context, gameManager);

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      MetadataContentProvider.scheme,
      metadataProvider
    ),
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );
}

export function deactivate(): void {
  if (gameManager) {
    gameManager.stop(false);
    gameManager.dispose();
  }
}
