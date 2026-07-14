import * as vscode from 'vscode';
import * as path from 'path';
import { getFileExtension } from '../utils';
import { Snippet } from '../services/snippetService';

export class FileHandler {
  public static async writeTempFile(rootPath: string, language: string, content: string): Promise<vscode.Uri> {
    const ext = getFileExtension(language);
    const fileName = `.practice_session_${Date.now()}.${ext}`;
    const fileUri = vscode.Uri.file(path.join(rootPath, fileName));

    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
    return fileUri;
  }

  public static async deleteTempFile(filePathOrUri: string | vscode.Uri): Promise<void> {
    const uri = typeof filePathOrUri === 'string' ? vscode.Uri.file(filePathOrUri) : filePathOrUri;
    try {
      await vscode.workspace.fs.delete(uri);
    } catch {
    }
  }

  public static async closeEditorIfOpen(fileUri: vscode.Uri): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.toString() === fileUri.toString()) {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    }
  }

  public static async setupPracticeDocument(
    snippet: Snippet
  ): Promise<{ uri: vscode.Uri; editor: vscode.TextEditor } | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Abra uma pasta no VS Code para iniciar a prática.');
      return null;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const normalizedCode = snippet.code.replace(/\r\n/g, '\n');
    snippet.code = normalizedCode;

    const fileUri = await this.writeTempFile(rootPath, snippet.language, normalizedCode);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One, false);

    return { uri: fileUri, editor };
  }
}
