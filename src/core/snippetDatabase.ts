import * as fs from 'fs';
import * as path from 'path';

export interface Snippet {
  id: string;
  code: string;
  comment: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  detailedExplanation: string;
  expectedOutput: string;
}

let loadedSnippets: Snippet[] = [];

export function loadExercises(extensionPath: string): Snippet[] {
  const exercisesPath = path.join(extensionPath, 'exercises');
  if (!fs.existsSync(exercisesPath)) {
    return [];
  }

  const snippets: Snippet[] = [];
  try {
    const languages = fs.readdirSync(exercisesPath);

    for (const lang of languages) {
      const langPath = path.join(exercisesPath, lang);
      if (!fs.statSync(langPath).isDirectory()) continue;

      const exercises = fs.readdirSync(langPath);
      for (const exerciseDir of exercises) {
        const exercisePath = path.join(langPath, exerciseDir);
        if (!fs.statSync(exercisePath).isDirectory()) continue;

        const metadataFile = path.join(exercisePath, 'metadata.json');
        if (!fs.existsSync(metadataFile)) continue;

        try {
          const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
          
          const files = fs.readdirSync(exercisePath);
          const codeFile = files.find(f => f.startsWith('code.'));
          if (!codeFile) continue;

          const codeContent = fs.readFileSync(path.join(exercisePath, codeFile), 'utf-8');

          snippets.push({
            id: `${lang}-${exerciseDir}`,
            code: codeContent.trim(),
            comment: metadata.comment || '',
            language: lang,
            difficulty: metadata.difficulty || 'easy',
            category: metadata.category || 'Geral',
            detailedExplanation: metadata.detailedExplanation || '',
            expectedOutput: metadata.expectedOutput || ''
          });
        } catch (err) {
          console.error(`Erro ao carregar exercício em ${exercisePath}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao ler diretório de exercícios:', err);
  }

  loadedSnippets = snippets;
  return snippets;
}

export function getSnippets(): Snippet[] {
  return loadedSnippets;
}

export function findSnippetById(id: string): Snippet | undefined {
  return loadedSnippets.find((s) => s.id === id);
}
