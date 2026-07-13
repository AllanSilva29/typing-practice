# Prática de Digitação - Gerador de Exercícios

Este utilitário permite a criação de novos exercícios para a extensão a partir de arquivos Markdown estruturados. O script realiza validações estritas para garantir a consistência dos metadados e do código fornecido.

---

## Como Executar o Script

Com o Node.js instalado, execute o comando a partir da raiz do projeto:

```bash
# Processar um único arquivo
node scripts/create-exercise.js exercicio.md

# Processar múltiplos arquivos individualmente
node scripts/create-exercise.js exercicio1.md exercicio2.md

# Processar vários arquivos em lote usando padrões glob (wildcard)
node scripts/create-exercise.js pasta-com-exercicios/*.md
```

Se o Markdown estiver em conformidade com o padrão exigido, o script irá criar a pasta do exercício sob `exercises/<linguagem>/<id>/` contendo o `metadata.json` e o `code.<extensao>` corretos.

---

## Formato Estrito do Markdown

Para que o exercício seja importado, o arquivo Markdown deve seguir exatamente o padrão abaixo. Qualquer desvio na estrutura resultará na rejeição e em um erro explicativo.

### Exemplo de Estrutura Válida (`exercicio.md`):

```markdown
---
language: python
id: binary-search
difficulty: easy
category: Algoritmos
comment: Uma breve descrição para a listagem da UI.
---

# Explicação Detalhada
O algoritmo de busca binária encontra a posição de um valor alvo dentro de um array ordenado...
Você pode usar parágrafos adicionais e formatação de texto aqui.

# Saída Esperada
[O resultado seria]:
Posição do elemento: 3
Busca concluída com sucesso!

# Código
```python
def binary_search(arr, target):
    # Corpo do código que o usuário irá digitar
    pass
```
```

---

## Regras de Validação

1. **Bloco de Metadados (Frontmatter):**
   - Deve ser delimitado por exatamente `---` no início e fim.
   - Contém pares `chave: valor` com as seguintes chaves obrigatórias:
     - `language`: Linguagem de programação correspondente (ex: `python`, `javascript`, `go`, `typescript`).
     - `id`: Identificador único do exercício em formato `kebab-case` (letras minúsculas e hífens). Ex: `binary-search`.
     - `difficulty`: Deve ser estritamente `easy`, `medium` ou `hard`.
     - `category`: Categoria temática (ex: `Algoritmos`, `Geral`).
     - `comment`: Descrição curta que aparecerá na barra lateral.
2. **Seção `# Explicação Detalhada`:**
   - Deve existir exatamente o cabeçalho `# Explicação Detalhada`.
   - O conteúdo explicativo deve ser preenchido abaixo do cabeçalho.
3. **Seção `# Saída Esperada`:**
   - Deve existir exatamente o cabeçalho `# Saída Esperada`.
   - Permite textos personalizados multilinhas descrevendo o console do terminal.
4. **Seção `# Código`:**
   - Deve existir exatamente o cabeçalho `# Código`.
   - O código deve ser inserido dentro de um único bloco de código Markdown delimitado por três crases (\`\`\`).
