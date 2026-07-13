import * as vscode from 'vscode';
import { deleteTempFile } from './handlers/fileHandler';
import { findSnippetById } from './snippetDatabase';

export class CodeExecutor {
  private outputChannel = vscode.window.createOutputChannel("Typing Practice Console");

  showExplanation(snippetId: string): void {
    const snippet = findSnippetById(snippetId);
    if (!snippet) return;

    setTimeout(() => {
      this.outputChannel.show(true);
      this.outputChannel.clear();
      this.outputChannel.appendLine(`[Exercício Iniciado: ${snippet.category} - ${snippet.language}]`);
      this.outputChannel.appendLine(`\n--- Explicação Detalhada do Código ---`);
      this.outputChannel.appendLine(snippet.detailedExplanation);
      this.outputChannel.appendLine(`--------------------------------------\n`);
    }, 150);
  }

  async execute(filePath: string, language: string, snippetId: string): Promise<void> {
    this.outputChannel.show(true);

    const snippet = findSnippetById(snippetId);
    if (!snippet) {
      this.outputChannel.appendLine(`Erro: Snippet ${snippetId} não encontrado.`);
      if (filePath) await deleteTempFile(filePath);
      return;
    }

    this.outputChannel.appendLine(`\n${snippet.expectedOutput}\n`);
    this.outputChannel.appendLine(`[Executando com sucesso]`);
    this.outputChannel.appendLine(`\n--- Navegação por Teclado ---`);
    this.outputChannel.appendLine(`➔ Pressione [Enter] para avançar para o PRÓXIMO exercício da árvore.`);
    this.outputChannel.appendLine(`➔ Pressione [Backspace] para retornar ao exercício ANTERIOR.`);
    this.outputChannel.appendLine(`-----------------------------\n`);

    if (filePath) {
      await deleteTempFile(filePath);
    }
  }
}
