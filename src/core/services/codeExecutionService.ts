import * as vscode from 'vscode';
import { FileHandler } from '../handlers/fileHandler';
import { SnippetService } from './snippetService';

export class CodeExecutionService {
  private outputChannel = vscode.window.createOutputChannel("Typing Practice Console");

  public showExplanation(snippetId: string): void {
    const snippet = SnippetService.getInstance().findSnippetById(snippetId);
    if (!snippet) return;

    setTimeout(() => {
      this.outputChannel.show(true);
      this.outputChannel.clear();
      this.outputChannel.appendLine(`[Exercício Iniciado: ${snippet.name} - ${snippet.language}]`);
      this.outputChannel.appendLine(`\n--- Explicação Detalhada do Código ---`);
      this.outputChannel.appendLine(snippet.detailedExplanation);
      this.outputChannel.appendLine(`--------------------------------------\n`);
    }, 400);
  }

  public async execute(filePath: string, language: string, snippetId: string): Promise<void> {
    this.outputChannel.show(true);

    const snippet = SnippetService.getInstance().findSnippetById(snippetId);
    if (!snippet) {
      this.outputChannel.appendLine(`Erro: Snippet ${snippetId} não encontrado.`);
      if (filePath) await FileHandler.deleteTempFile(filePath);
      return;
    }

    this.outputChannel.appendLine(`\n${snippet.expectedOutput}\n`);
    this.outputChannel.appendLine(`[Executando com sucesso]`);
    this.outputChannel.appendLine(`\n--- Navegação por Teclado ---`);
    this.outputChannel.appendLine(`➔ Pressione [Enter] para avançar para o PRÓXIMO exercício da árvore.`);
    this.outputChannel.appendLine(`➔ Pressione [Backspace] para retornar ao exercício ANTERIOR.`);
    this.outputChannel.appendLine(`-----------------------------\n`);

    if (filePath) {
      await FileHandler.deleteTempFile(filePath);
    }
  }
}
