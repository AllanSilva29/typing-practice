---
name: Range
language: go
id: range
difficulty: medium
category: Coleções
comment: Escrever índices manualmente é divertido até a terceira centena de elementos.
---

# Explicação Detalhada

A palavra-chave `range` facilita a iteração sobre coleções.

Ela retorna dois valores:

- índice;
- elemento.

Caso um deles não seja necessário, utiliza-se o identificador `_`.

Neste exercício percorremos um slice imprimindo seus índices e valores.

# Saída Esperada

0 -> Go

1 -> Rust

2 -> Python

3 -> Java

# Código

```go
package main

import "fmt"

func main() {
	linguagens := []string{
		"Go",
		"Rust",
		"Python",
		"Java",
	}

	for indice, linguagem := range linguagens {
		fmt.Println(indice, "->", linguagem)
	}
}
```