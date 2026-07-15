---
name: Ponteiros
language: go
id: pointers
difficulty: medium
category: Ponteiros
comment: O famoso assunto que assusta iniciantes. No Go ele é muito menos dramático do que sua reputação sugere.
---

# Explicação Detalhada

Um ponteiro armazena o endereço de memória de uma variável.

O operador `&` obtém o endereço de uma variável.

O operador `*` acessa o valor armazenado nesse endereço.

Ponteiros permitem modificar valores sem fazer cópias desnecessárias.

# Saída Esperada

Valor: 10

Valor alterado: 20

# Código

```go
package main

import "fmt"

func alterar(numero *int) {
	*numero = 20
}

func main() {
	valor := 10

	fmt.Println("Valor:", valor)

	alterar(&valor)

	fmt.Println("Valor alterado:", valor)
}
```