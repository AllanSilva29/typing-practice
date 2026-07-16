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

export function getCommentPrefix(language: string): string {
  const lang = language.toLowerCase();
  if (lang === 'python') {
    return '#';
  }
  return '//';
}

export function getLevenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  let prevRow = new Array(s2.length + 1);
  let currRow = new Array(s2.length + 1);

  for (let j = 0; j <= s2.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    currRow[0] = i;
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,     // insertion
        prevRow[j] + 1,         // deletion
        prevRow[j - 1] + cost   // substitution
      );
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }
  return prevRow[s2.length];
}

export function cleanUserText(text: string, commentPrefix: string): string {
  const lines = text.split(/\r?\n/);
  if (lines.length > 0 && lines[0].trim().startsWith(`${commentPrefix} agora sua vez.`)) {
    lines.shift();
  }
  return lines.join('\n').trim();
}

