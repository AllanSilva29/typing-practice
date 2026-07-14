import * as fs from 'fs';
import * as path from 'path';

export interface Snippet {
  id: string;
  name: string;
  code: string;
  comment: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  detailedExplanation: string;
  expectedOutput: string;
  relativePath: string;
}

export class SnippetService {
  private static instance: SnippetService;
  private loadedSnippets: Snippet[] = [];

  private constructor() { }

  public static getInstance(): SnippetService {
    if (!SnippetService.instance) {
      SnippetService.instance = new SnippetService();
    }
    return SnippetService.instance;
  }

  public loadExercises(extensionPath: string): Snippet[] {
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

        const exercisePaths = this.findExerciseDirs(langPath);

        for (const exercisePath of exercisePaths) {
          const metadataFile = path.join(exercisePath, 'metadata.json');
          if (!fs.existsSync(metadataFile)) continue;

          try {
            const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
            if (!metadata ||
              typeof metadata.name !== 'string' || metadata.name.trim() === '' ||
              typeof metadata.category !== 'string' || metadata.category.trim() === '' ||
              typeof metadata.comment !== 'string' || metadata.comment.trim() === '') {
              continue;
            }

            const files = fs.readdirSync(exercisePath);
            const codeFile = files.find((f) => f.startsWith('code.'));
            if (!codeFile) continue;

            const codeContent = fs.readFileSync(path.join(exercisePath, codeFile), 'utf-8');

            const relativePath = path.relative(langPath, exercisePath);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const exerciseId = normalizedPath.replace(/\//g, '-');

            snippets.push({
              id: `${lang}-${exerciseId}`,
              name: metadata.name,
              code: codeContent.trim(),
              comment: metadata.comment,
              language: lang,
              difficulty: metadata.difficulty || 'easy',
              category: metadata.category,
              detailedExplanation: metadata.detailedExplanation || '',
              expectedOutput: metadata.expectedOutput || '',
              relativePath: normalizedPath
            });
          } catch (err) {
            console.error(`Erro ao carregar exercício em ${exercisePath}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao ler diretório de exercícios:', err);
    }

    this.loadedSnippets = snippets;
    return snippets;
  }

  public getSnippets(): Snippet[] {
    return this.loadedSnippets;
  }

  public findSnippetById(id: string): Snippet | undefined {
    return this.loadedSnippets.find((s) => s.id === id);
  }

  private findExerciseDirs(dirPath: string): string[] {
    const exerciseDirs: string[] = [];

    const traverse = (currentPath: string): void => {
      let files: string[];
      try {
        files = fs.readdirSync(currentPath);
      } catch {
        return;
      }

      const hasMetadata = files.includes('metadata.json');
      const hasCode = files.some((f) => f.startsWith('code.'));

      if (hasMetadata && hasCode) {
        try {
          const metadataContent = fs.readFileSync(path.join(currentPath, 'metadata.json'), 'utf-8');
          const metadata = JSON.parse(metadataContent);
          if (metadata &&
            typeof metadata.name === 'string' && metadata.name.trim() !== '' &&
            typeof metadata.category === 'string' && metadata.category.trim() !== '' &&
            typeof metadata.comment === 'string' && metadata.comment.trim() !== '') {
            exerciseDirs.push(currentPath);
          }
        } catch {
          // Ignora erro
        }
      }

      for (const file of files) {
        const fullPath = path.join(currentPath, file);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            traverse(fullPath);
          }
        } catch {
        }
      }
    };

    traverse(dirPath);
    return exerciseDirs;
  }
}
