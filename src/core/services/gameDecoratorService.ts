import * as vscode from 'vscode';
import { positionAt } from '../utils';

export class GameDecoratorService {
  private correctDecoration: vscode.TextEditorDecorationType;
  private errorDecoration: vscode.TextEditorDecorationType;
  private remainingDecoration: vscode.TextEditorDecorationType;

  constructor() {
    this.correctDecoration = vscode.window.createTextEditorDecorationType({
      color: 'var(--vscode-editor-foreground)',
      opacity: '1.0'
    });

    this.errorDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(239, 68, 68, 0.25)',
      borderBottom: '2px solid rgba(239, 68, 68, 0.8)',
      borderRadius: '2px'
    });

    this.remainingDecoration = vscode.window.createTextEditorDecorationType({
      opacity: '0.3'
    });
  }

  public clear(editor: vscode.TextEditor): void {
    editor.setDecorations(this.correctDecoration, []);
    editor.setDecorations(this.errorDecoration, []);
    editor.setDecorations(this.remainingDecoration, []);
  }

  public update(editor: vscode.TextEditor, code: string, currentIndex: number, errorIndex: number): void {
    const endCorrectOffset = errorIndex !== -1 ? currentIndex : currentIndex;
    const correctRange = new vscode.Range(
      new vscode.Position(0, 0),
      positionAt(code, endCorrectOffset)
    );
    editor.setDecorations(this.correctDecoration, [correctRange]);

    let errorRanges: vscode.Range[] = [];
    if (errorIndex !== -1) {
      if (code[errorIndex] === '\n' && errorIndex > 0) {
        errorRanges = [
          new vscode.Range(positionAt(code, errorIndex - 1), positionAt(code, errorIndex))
        ];
      } else {
        errorRanges = [
          new vscode.Range(positionAt(code, errorIndex), positionAt(code, errorIndex + 1))
        ];
      }
    }
    editor.setDecorations(this.errorDecoration, errorRanges);

    const startRemainingOffset = errorIndex !== -1 ? currentIndex + 1 : currentIndex;
    const remainingRange = new vscode.Range(
      positionAt(code, startRemainingOffset),
      positionAt(code, code.length)
    );
    editor.setDecorations(this.remainingDecoration, [remainingRange]);
  }

  public syncCursor(editor: vscode.TextEditor, code: string, currentIndex: number, errorIndex: number): void {
    const targetOffset = errorIndex !== -1 ? currentIndex : currentIndex;
    const targetPosition = positionAt(code, targetOffset);
    editor.selection = new vscode.Selection(targetPosition, targetPosition);
    editor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }
}
