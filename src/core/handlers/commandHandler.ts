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

    const pasteCommand = vscode.commands.registerCommand('paste', async (args) => {
      if (gameManager.isPlaying) {
        return;
      }
      await vscode.commands.executeCommand('default:paste', args);
    });

    const cutCommand = vscode.commands.registerCommand('cut', async (args) => {
      if (gameManager.isPlaying) {
        return;
      }
      await vscode.commands.executeCommand('default:cut', args);
    });

    const deleteWordLeftCommand = vscode.commands.registerCommand('deleteWordLeft', async () => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) {
        await vscode.commands.executeCommand('default:deleteWordLeft');
        return;
      }
      await gameManager.handleBackspace();
    });

    const deleteRightCommand = vscode.commands.registerCommand('deleteRight', async () => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) {
        await vscode.commands.executeCommand('default:deleteRight');
        return;
      }
    });

    const deleteWordRightCommand = vscode.commands.registerCommand('deleteWordRight', async () => {
      if (!gameManager.isPlaying && !gameManager.isCompleted) {
        await vscode.commands.executeCommand('default:deleteWordRight');
        return;
      }
    });

    const showExplanationCommand = vscode.commands.registerCommand(
      'typingPractice.showExplanationDetails',
      (lineNum: number, explanation: string) => {
        vscode.window.showInformationMessage(`Linha ${lineNum}: ${explanation}`);
      }
    );

    context.subscriptions.push(
      typeCommand,
      deleteLeftCommand,
      stopCommand,
      resetCommand,
      pasteCommand,
      cutCommand,
      deleteWordLeftCommand,
      deleteRightCommand,
      deleteWordRightCommand,
      showExplanationCommand
    );
  }
}
