---
name: If e Else
language: go
id: if-else
difficulty: easy
category: Controle de Fluxo
comment: Finalmente o programa começou a tomar decisões. Ainda não são boas decisões, mas é um começo.
---

# Explicação Detalhada

A estrutura `if` permite executar blocos diferentes dependendo de uma condição.

Sua sintaxe é simples:

```go
if condição {
	// código
}
```

Também é possível adicionar um bloco `else`.

```go
if condição {
	// verdadeiro
} else {
	// falso
}
```

As condições devem sempre resultar em um valor booleano.

Neste exercício verificamos se uma pessoa é maior de idade.

# Saída Esperada

Idade: 20

Maior de idade.

# Código

```go
package main

import "fmt"

func main() {
	idade := 20

	fmt.Println("Idade:", idade)

	if idade >= 18 {
		fmt.Println("Maior de idade.")
	} else {
		fmt.Println("Menor de idade.")
	}
}
```