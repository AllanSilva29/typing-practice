import * as vscode from 'vscode';
import { SnippetService } from './snippetService';

export interface GameRecord {
  ppm: number;
  accuracy: number;
  snippetId: string;
  timestamp: number;
}

export interface FormattedRecord extends GameRecord {
  name: string;
  category: string;
  language: string;
  comment: string;
}

export interface ProgressState {
  isPlaying: boolean;
  stats: {
    totalCompleted: string;
    avgPpm: number;
    avgAccuracy: number;
  };
  history: FormattedRecord[];
}

export class ProgressService {
  private static instance: ProgressService;

  private constructor(private readonly context: vscode.ExtensionContext) {}

  public static initialize(context: vscode.ExtensionContext): ProgressService {
    ProgressService.instance = new ProgressService(context);
    return ProgressService.instance;
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      throw new Error('ProgressService não foi inicializado. Chame ProgressService.initialize(context) primeiro.');
    }
    return ProgressService.instance;
  }

  public async addRecord(record: { ppm: number; accuracy: number; snippetId: string }): Promise<void> {
    const history: GameRecord[] = this.context.globalState.get('history') || [];
    history.push({
      ...record,
      timestamp: Date.now()
    });
    await this.context.globalState.update('history', history);
  }

  public async clearProgress(): Promise<void> {
    await this.context.globalState.update('history', []);
  }

  public getProgressState(isPlaying: boolean): ProgressState {
    const history: GameRecord[] = this.context.globalState.get('history') || [];
    const totalRuns = history.length;

    const avgPpm = totalRuns > 0
      ? Math.round(history.reduce((sum, item) => sum + item.ppm, 0) / totalRuns)
      : 0;

    const avgAccuracy = totalRuns > 0
      ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / totalRuns)
      : 0;

    const snippetDb = SnippetService.getInstance();
    const allSnippets = snippetDb.getSnippets();
    const totalExercises = allSnippets.length;

    // Filtra apenas IDs de snippets únicos que de fato existem na base atual
    const uniqueCompleted = new Set(
      history
        .map(h => h.snippetId)
        .filter(id => allSnippets.some(s => s.id === id))
    ).size;
    
    const totalCompletedLabel = `${uniqueCompleted}/${totalExercises}`;

    const formattedHistory = history.map((h) => {
      const snippet = snippetDb.findSnippetById(h.snippetId);
      return {
        ...h,
        name: snippet?.name || 'Desconhecido',
        category: snippet?.category || 'Desconhecido',
        language: snippet?.language || 'Desconhecida',
        comment: snippet?.comment || ''
      };
    }).reverse();

    return {
      isPlaying,
      stats: {
        totalCompleted: totalCompletedLabel,
        avgPpm,
        avgAccuracy
      },
      history: formattedHistory
    };
  }
}
