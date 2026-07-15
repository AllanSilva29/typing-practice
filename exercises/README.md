# Guia de Criação de Exercícios

Este diretório contém a base de dados dinâmica de exercícios da extensão de prática de digitação. A extensão lê as subpastas recursivamente e carrega os snippets em memória.

---

## Estrutura de Diretórios

Para adicionar um novo exercício, crie uma subpasta dentro da linguagem de programação desejada seguindo o padrão abaixo:

```text
exercises/
  └── <linguagem>/
      └── <id-do-exercicio>/
          ├── metadata.json
          └── code.<extensao>
```

### Exemplo Físico:
```text
exercises/
  └── python/
      └── binary-search/
          ├── metadata.json
          └── code.py
```

---

## 1. O Arquivo `metadata.json`

Contém as configurações de dificuldade, categorização, comentários de exibição e explicações.

```json
{
  "difficulty": "easy",
  "category": "Algoritmos",
  "comment": "Uma breve descrição do snippet de código.",
  "detailedExplanation": "Uma explicação passo a passo extremamente detalhada descrevendo o que o algoritmo faz e como cada linha lógica opera.",
  "expectedOutput": "[O resultado seria]: <saída simulada de execução no console>"
}
```

### Propriedades:
* **`difficulty`**: Grau de dificuldade do exercício. Deve ser `"easy"`, `"medium"` ou `"hard"`.
* **`category`**: A categoria temática do exercício (ex: `"Estruturas de Dados"`, `"Algoritmos"`, `"Assincronismo"`, `"Geral"`).
* **`comment`**: Texto curto exibido na barra lateral/UI do VS Code para descrever o snippet.
* **`detailedExplanation`**: Explicação exibida no console de Output assim que o usuário inicia o teste. Use formatação limpa e quebras de linha (`\n`) para melhor legibilidade.
* **`expectedOutput`**: O resultado de execução simulada exibido no console após o usuário terminar de digitar todo o código. Deve iniciar preferencialmente com `[O resultado seria]: `.

---

## 2. O Arquivo `code.<extensao>`

Este arquivo deve conter **apenas** o código puro do snippet que o usuário deverá digitar. 

* **Nome do Arquivo:** O arquivo deve obrigatoriamente iniciar com `code.` (ex: `code.ts`, `code.js`, `code.py`, `code.go`, `code.java`).
* **Sintaxe Limpa:** Escreva o código normalmente. Aproveite o highlight de sintaxe e o linter nativo do VS Code enquanto você o edita.
* **Espaços e Indentação:** A extensão suporta qualquer tipo de indentação. Se o seu snippet inicia com recuos, o cursor saltará automaticamente para a primeira posição de caractere válido na inicialização do teste.

---

## 3. Ordenação Personalizada (Opcional)

Por padrão, a extensão carrega as pastas e exercícios em ordem alfabética. Caso queira definir uma ordem específica de exibição para as categorias, módulos ou exercícios, você pode criar um arquivo `metadata.json` na **pasta pai** contendo a propriedade `"order"` com a lista de pastas filhas na ordem desejada.

### Estrutura Visual:
```text
exercises/
  └── go/
      ├── metadata.json       <-- [OPCIONAL] Ordena os módulos (ex: ["module-1", "module-2"])
      ├── module-1/
      │   ├── metadata.json   <-- [OPCIONAL] Ordena os exercícios (ex: ["hello-world", "variables"])
      │   ├── hello-world/
      │   │   ├── metadata.json
      │   │   └── code.go
      │   └── variables/
      │       ├── metadata.json
      │       └── code.go
      └── module-2/
          ...
```

### Exemplo de `metadata.json` de Pasta Pai:
```json
{
  "order": [
    "hello-world",
    "variables",
    "constants"
  ]
}
```

### Regras de Ordenação:
* **`order`**: Array de strings com os nomes exatos das subpastas imediatas na sequência em que devem aparecer.
* Subpastas que **não** forem listadas no array `"order"` serão enviadas para o fim da lista e ordenadas alfabeticamente.
