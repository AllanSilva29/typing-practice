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
      const exercisePaths = this.getSortedExercisePaths(exercisesPath);

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

          const relativeToExercises = path.relative(exercisesPath, exercisePath);
          const parts = relativeToExercises.split(path.sep);
          const lang = parts[0];

          const relativeToLang = parts.slice(1).join('/');
          const exerciseId = relativeToLang.replace(/\//g, '-');

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
            relativePath: relativeToLang
          });
        } catch (err) {
          console.error(`Erro ao carregar exercício em ${exercisePath}:`, err);
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

  private getSortedExercisePaths(dirPath: string): string[] {
    let files: string[];
    try {
      files = fs.readdirSync(dirPath);
    } catch {
      return [];
    }

    const hasMetadata = files.includes('metadata.json');
    const hasCode = files.some((f) => f.startsWith('code.'));

    if (hasMetadata && hasCode) {
      try {
        const metadataContent = fs.readFileSync(path.join(dirPath, 'metadata.json'), 'utf-8');
        const metadata = JSON.parse(metadataContent);
        if (metadata &&
          typeof metadata.name === 'string' && metadata.name.trim() !== '' &&
          typeof metadata.category === 'string' && metadata.category.trim() !== '' &&
          typeof metadata.comment === 'string' && metadata.comment.trim() !== '') {
          return [dirPath];
        }
      } catch {
        // Ignora erro de parsing e trata como diretório comum
      }
    }

    let order: string[] = [];
    if (hasMetadata) {
      try {
        const metadataContent = fs.readFileSync(path.join(dirPath, 'metadata.json'), 'utf-8');
        const metadata = JSON.parse(metadataContent);
        if (metadata && Array.isArray(metadata.order)) {
          order = metadata.order;
        }
      } catch {
        // Ignora erro
      }
    }

    const subDirs: string[] = [];
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          subDirs.push(file);
        }
      } catch {
      }
    }

    if (order.length > 0) {
      subDirs.sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.localeCompare(b);
      });
    } else {
      subDirs.sort((a, b) => a.localeCompare(b));
    }

    const exerciseDirs: string[] = [];
    for (const subDir of subDirs) {
      exerciseDirs.push(...this.getSortedExercisePaths(path.join(dirPath, subDir)));
    }

    return exerciseDirs;
  }
}
