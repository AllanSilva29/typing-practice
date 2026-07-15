---
name: Escopo de Variáveis
language: go
id: variable-scope
difficulty: easy
category: Fundamentos
comment: O fato de você ter criado uma variável não significa que ela queira ser vista por todo o programa.
---

# Explicação Detalhada

O escopo define onde uma variável pode ser utilizada.

Uma variável declarada dentro de um bloco (`{}`) existe apenas dentro daquele bloco.

Após o bloco terminar, a variável deixa de existir.

Isso evita conflitos de nomes e torna o código mais organizado.

Neste exemplo a variável `mensagem` só pode ser utilizada dentro do `if`.

# Saída Esperada

Entrou no bloco.

Esta variável existe apenas aqui.

Fim do programa.

# Código

```go
package main

import "fmt"

func main() {
	if true {
		mensagem := "Esta variável existe apenas aqui."

		fmt.Println("Entrou no bloco.")
		fmt.Println(mensagem)
	}

	fmt.Println("Fim do programa.")
}
```