import * as vscode from 'vscode';
import { positionAt } from '../utils';

export function enforceCursorPosition(
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
