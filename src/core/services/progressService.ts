import * as vscode from 'vscode';
import { findSnippetById } from '../snippetDatabase';

export interface GameRecord {
  ppm: number;
  accuracy: number;
  snippetId: string;
  timestamp: number;
}

export interface FormattedRecord extends GameRecord {
  category: string;
  language: string;
  comment: string;
}

export interface ProgressState {
  isPlaying: boolean;
  stats: {
    totalCompleted: number;
    avgPpm: number;
    avgAccuracy: number;
  };
  history: FormattedRecord[];
}

export async function addRecord(
  context: vscode.ExtensionContext,
  record: { ppm: number; accuracy: number; snippetId: string }
): Promise<void> {
  const history: GameRecord[] = context.globalState.get('history') || [];
  history.push({
    ...record,
    timestamp: Date.now()
  });
  await context.globalState.update('history', history);
}

export async function clearProgress(context: vscode.ExtensionContext): Promise<void> {
  await context.globalState.update('history', []);
}

export function getProgressState(context: vscode.ExtensionContext, isPlaying: boolean): ProgressState {
  const history: GameRecord[] = context.globalState.get('history') || [];
  const totalCompleted = history.length;

  const avgPpm = totalCompleted > 0
    ? Math.round(history.reduce((sum, item) => sum + item.ppm, 0) / totalCompleted)
    : 0;

  const avgAccuracy = totalCompleted > 0
    ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / totalCompleted)
    : 0;

  const formattedHistory = history.map((h) => {
    const snippet = findSnippetById(h.snippetId);
    return {
      ...h,
      category: snippet?.category || 'Desconhecido',
      language: snippet?.language || 'Desconhecida',
      comment: snippet?.comment || ''
    };
  }).reverse();

  return {
    isPlaying,
    stats: {
      totalCompleted,
      avgPpm,
      avgAccuracy
    },
    history: formattedHistory
  };
}
