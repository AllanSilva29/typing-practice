import * as vscode from 'vscode';
import { GameManager } from './core/gameManager';
import { SidebarProvider } from './views/sidebarProvider';
import { loadExercises } from './core/snippetDatabase';
import {
  handleTypeCommand,
  handleBackspaceCommand,
  handleStopCommand,
  handleResetCommand
} from './core/handlers/commandHandler';

let gameManager: GameManager;

export function activate(context: vscode.ExtensionContext) {
  loadExercises(context.extensionPath);
  gameManager = new GameManager();

  const sidebarProvider = new SidebarProvider(context.extensionUri, context, gameManager);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  const typeCommand = vscode.commands.registerCommand('type', async (args) => {
    await handleTypeCommand(gameManager, args);
  });

  const deleteLeftCommand = vscode.commands.registerCommand('deleteLeft', async () => {
    await handleBackspaceCommand(gameManager);
  });

  const stopCommand = vscode.commands.registerCommand('typingPractice.stop', async () => {
    await handleStopCommand(gameManager);
  });

  const resetCommand = vscode.commands.registerCommand('typingPractice.reset', async () => {
    await handleResetCommand(context);
  });

  context.subscriptions.push(
    typeCommand,
    deleteLeftCommand,
    stopCommand,
    resetCommand
  );
}

export function deactivate() {
  if (gameManager) {
    gameManager.stop(false);
    gameManager.dispose();
  }
}

