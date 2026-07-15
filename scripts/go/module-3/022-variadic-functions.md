---
name: Funções Variádicas
language: go
id: variadic-functions
difficulty: medium
category: Funções
comment: Finalmente uma função que aceita quantos argumentos você quiser. Ela é mais paciente que a maioria dos programadores.
---

# Explicação Detalhada

Uma função variádica aceita uma quantidade variável de argumentos.

Isso é feito utilizando `...` antes do tipo.

```go
func soma(valores ...int)
```

Dentro da função, os argumentos são tratados como um slice.

Esse recurso é bastante utilizado na biblioteca padrão.

# Saída Esperada

Soma: 15

# Código

```go
package main

import "fmt"

func soma(valores ...int) int {
	total := 0

	for _, valor := range valores {
		total += valor
	}

	return total
}

func main() {
	fmt.Println("Soma:", soma(1, 2, 3, 4, 5))
}
```