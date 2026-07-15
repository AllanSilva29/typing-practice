---
name: Break
language: go
id: break
difficulty: easy
category: Laços
comment: Quando você já encontrou o que queria e não pretende continuar trabalhando.
---

# Explicação Detalhada

A instrução `break` encerra imediatamente o laço atual.

Ela é útil quando uma condição especial é encontrada e não faz sentido continuar a repetição.

Neste exemplo o laço é interrompido ao chegar no número 5.

# Saída Esperada

1

2

3

4

Número encontrado.

# Código

```go
package main

import "fmt"

func main() {
	for i := 1; i <= 10; i++ {
		if i == 5 {
			fmt.Println("Número encontrado.")
			break
		}

		fmt.Println(i)
	}
}
```