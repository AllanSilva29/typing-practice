import * as vscode from 'vscode';
import { positionAt } from '../utils';

export class SelectionHandler {
  public static enforceCursorPosition(
    e: vscode.TextEditorSelectionChangeEvent,
    gameUri: vscode.Uri | null,
    currentIndex: number,
    errorIndex: number,
    code: string
  ): void {
    if (!gameUri || e.textEditor.document.uri.toString() !== gameUri.toString()) return;

    const targetOffset = errorIndex !== -1 ? currentIndex : currentIndex;
    const targetPosition = positionAt(code, targetOffset);

    if (!e.selections[0].isEmpty || !e.selections[0].active.isEqual(targetPosition)) {
      e.textEditor.selection = new vscode.Selection(targetPosition, targetPosition);
    }
  }

  public static async performFallbackBackspace(): Promise<void> {
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
}
