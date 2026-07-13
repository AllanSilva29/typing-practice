import * as vscode from 'vscode';
import { GameManager } from '../gameManager';

export async function handleTypeCommand(gameManager: GameManager, args: any): Promise<void> {
  if (!gameManager.isPlaying && !gameManager.isCompleted) {
    await vscode.commands.executeCommand('default:type', args);
    return;
  }
  await gameManager.handleType(args.text);
}

export async function handleBackspaceCommand(gameManager: GameManager): Promise<void> {
  if (!gameManager.isPlaying && !gameManager.isCompleted) {
    await gameManager.fallbackBackspace();
    return;
  }
  await gameManager.handleBackspace();
}

export async function handleStopCommand(gameManager: GameManager): Promise<void> {
  if (!gameManager.isPlaying && !gameManager.isCompleted) return;
  await gameManager.stop(false);
  vscode.window.showInformationMessage('Prática de digitação encerrada.');
}

export async function handleResetCommand(context: vscode.ExtensionContext): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    'Tem certeza de que deseja resetar todo o seu progresso de digitação?',
    'Sim',
    'Não'
  );
  if (confirm !== 'Sim') return;
  
  await context.globalState.update('history', []);
  vscode.window.showInformationMessage('Progresso de digitação resetado.');
}
