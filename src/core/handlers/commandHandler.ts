import * as vscode from 'vscode';
import { GameManager } from '../gameManager';
import { SelectionHandler } from './selectionHandler';
import { ProgressService } from '../services/progressService';

export class CommandHandler {
  public static register(context: vscode.ExtensionContext, gameManager: GameManager): void {
    const typeCommand = vscode.commands.registerCommand('type', async (args) => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) {
        await vscode.commands.executeCommand('default:type', args);
        return;
      }
      await gameManager.handleType(args.text);
    });

    const deleteLeftCommand = vscode.commands.registerCommand('deleteLeft', async () => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) {
        await SelectionHandler.performFallbackBackspace();
        return;
      }
      await gameManager.handleBackspace();
    });

    const stopCommand = vscode.commands.registerCommand('typingPractice.stop', async () => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) return;
      await gameManager.stop(false);
      vscode.window.showInformationMessage('Prática de digitação encerrada.');
    });

    const resetCommand = vscode.commands.registerCommand('typingPractice.reset', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Tem certeza de que deseja resetar todo o seu progresso de digitação?',
        'Sim',
        'Não'
      );
      if (confirm !== 'Sim') return;

      await ProgressService.getInstance().clearProgress();
      vscode.window.showInformationMessage('Progresso de digitação resetado.');
    });

    context.subscriptions.push(typeCommand, deleteLeftCommand, stopCommand, resetCommand);
  }
}
