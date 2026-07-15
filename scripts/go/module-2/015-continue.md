---
name: Continue
language: go
id: continue
difficulty: easy
category: Laços
comment: Às vezes o melhor plano é simplesmente ignorar o problema e seguir adiante.
---

# Explicação Detalhada

A instrução `continue` interrompe apenas a iteração atual do laço.

A execução volta imediatamente para a próxima repetição.

Neste exercício ignoramos o número 3.

# Saída Esperada

1

2

4

5

# Código

```go
package main

import "fmt"

func main() {
	for i := 1; i <= 5; i++ {
		if i == 3 {
			continue
		}

		fmt.Println(i)
	}
}
```