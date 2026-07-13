import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getFileExtension } from '../utils';

export async function writeTempFile(rootPath: string, language: string, content: string): Promise<vscode.Uri> {
  const ext = getFileExtension(language);
  const fileName = `.practice_session_${Date.now()}.${ext}`;
  const fileUri = vscode.Uri.file(path.join(rootPath, fileName));

  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
  return fileUri;
}

export async function deleteTempFile(filePathOrUri: string | vscode.Uri): Promise<void> {
  const uri = typeof filePathOrUri === 'string' ? vscode.Uri.file(filePathOrUri) : filePathOrUri;
  try {
    await vscode.workspace.fs.delete(uri);
  } catch (e) {
  }
}

export async function closeEditorIfOpen(fileUri: vscode.Uri): Promise<void> {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.uri.toString() === fileUri.toString()) {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  }
}
