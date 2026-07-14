import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class MetadataContentProvider implements vscode.TextDocumentContentProvider {
  public static readonly scheme = 'typing-practice-metadata';

  constructor(private readonly extensionPath: string) { }

  provideTextDocumentContent(uri: vscode.Uri): string {
    let relativePath = uri.path;
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.slice(1);
    }

    const folderPath = path.join(this.extensionPath, 'exercises', relativePath);
    const metadataFile = path.join(folderPath, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      return `# Erro\n\nNenhum arquivo metadata.json encontrado em: ${relativePath}`;
    }

    try {
      const content = fs.readFileSync(metadataFile, 'utf-8');
      const metadata = JSON.parse(content);

      if (metadata.name || metadata.difficulty) {
        const name = metadata.name || 'Exercício Sem Nome';
        const difficulty = metadata.difficulty ? metadata.difficulty.toUpperCase() : 'EASY';
        const category = metadata.category || 'Geral';
        const comment = metadata.comment || 'Sem comentário.';
        const detailedExplanation = metadata.detailedExplanation || 'Sem explicação detalhada.';
        const expectedOutput = metadata.expectedOutput || 'Nenhuma saída esperada configurada.';

        return `# ${name}\n\n` +
          `**Dificuldade**: ${difficulty}\n` +
          `**Categoria**: ${category}\n\n` +
          `*${comment}*\n\n` +
          `## Explicação Detalhada\n` +
          `${detailedExplanation}\n\n` +
          `## Saída Esperada\n` +
          `\`\`\`\n` +
          `${expectedOutput}\n` +
          `\`\`\`\n`;
      } else {
        // Categoria/Pasta comum
        const category = metadata.category || 'Sem Categoria';
        const comment = metadata.comment || 'Sem comentário.';
        return `# ${category}\n\n${comment}\n`;
      }
    } catch (err: any) {
      return `# Erro ao ler metadados\n\n${err.message}`;
    }
  }
}
