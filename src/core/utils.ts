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

export const ACCENT_MAP: { [key: string]: { accents: string[], base: string } } = {
  // Tilde
  'ã': { accents: ['~'], base: 'a' },
  'õ': { accents: ['~'], base: 'o' },
  'Ã': { accents: ['~'], base: 'A' },
  'Õ': { accents: ['~'], base: 'O' },
  // Acute
  'á': { accents: ['´', '\''], base: 'a' },
  'é': { accents: ['´', '\''], base: 'e' },
  'í': { accents: ['´', '\''], base: 'i' },
  'ó': { accents: ['´', '\''], base: 'o' },
  'ú': { accents: ['´', '\''], base: 'u' },
  'Á': { accents: ['´', '\''], base: 'A' },
  'É': { accents: ['´', '\''], base: 'E' },
  'Í': { accents: ['´', '\''], base: 'I' },
  'Ó': { accents: ['´', '\''], base: 'O' },
  'Ú': { accents: ['´', '\''], base: 'U' },
  // Cedilla
  'ç': { accents: ['´', '\''], base: 'c' },
  'Ç': { accents: ['´', '\''], base: 'C' },
  // Circumflex
  'â': { accents: ['^'], base: 'a' },
  'ê': { accents: ['^'], base: 'e' },
  'ô': { accents: ['^'], base: 'o' },
  'Â': { accents: ['^'], base: 'A' },
  'Ê': { accents: ['^'], base: 'E' },
  'Ô': { accents: ['^'], base: 'O' },
  // Grave
  'à': { accents: ['`'], base: 'a' },
  'À': { accents: ['`'], base: 'A' },
  // Umlaut
  'ä': { accents: ['¨', '"'], base: 'a' },
  'ë': { accents: ['¨', '"'], base: 'e' },
  'ï': { accents: ['¨', '"'], base: 'i' },
  'ö': { accents: ['¨', '"'], base: 'o' },
  'ü': { accents: ['¨', '"'], base: 'u' },
  'Ä': { accents: ['¨', '"'], base: 'A' },
  'Ë': { accents: ['¨', '"'], base: 'E' },
  'Ï': { accents: ['¨', '"'], base: 'I' },
  'Ö': { accents: ['¨', '"'], base: 'O' },
  'Ü': { accents: ['¨', '"'], base: 'U' },
};

export function isDoubleTrigger(charA: string, charB: string): boolean {
  if (charA === charB) return true;

  const compA = ACCENT_MAP[charA];
  if (compA && (compA.base === charB || compA.accents.includes(charB))) {
    return true;
  }

  const compB = ACCENT_MAP[charB];
  if (compB && (compB.base === charA || compB.accents.includes(charA))) {
    return true;
  }

  return false;
}
