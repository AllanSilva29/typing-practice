---
name: Closures
language: go
id: closures
difficulty: medium
category: Funções
comment: A função foi embora, mas levou algumas variáveis na mochila. Go permite esse tipo de apego emocional.
---

# Explicação Detalhada

Closures são funções que conseguem acessar variáveis do ambiente onde foram criadas.

Mesmo depois que a função externa termina, essas variáveis continuam existindo enquanto a closure puder acessá-las.

Esse recurso é bastante utilizado para encapsular estado.

# Saída Esperada

1

2

3

# Código

```go
package main

import "fmt"

func contador() func() int {
	valor := 0

	return func() int {
		valor++
		return valor
	}
}

func main() {
	proximo := contador()

	fmt.Println(proximo())
	fmt.Println(proximo())
	fmt.Println(proximo())
}
```