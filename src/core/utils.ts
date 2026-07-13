import * as vscode from 'vscode';

export function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    python: 'py',
    go: 'go',
    java: 'java'
  };
  return extensions[language.toLowerCase()] ?? 'txt';
}

export function positionAt(text: string, offset: number): vscode.Position {
  let line = 0;
  let col = 0;
  const length = Math.min(offset, text.length);
  for (let i = 0; i < length; i++) {
    if (text[i] === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
  }
  return new vscode.Position(line, col);
}

export function skipWhitespace(text: string, startIndex: number): number {
  let index = startIndex;
  while (index < text.length && (text[index] === ' ' || text[index] === '\t')) {
    index++;
  }
  return index;
}
