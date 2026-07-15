---
name: Append
language: go
id: append
difficulty: medium
category: Coleções
comment: Diferente dos arrays, slices aceitam crescer. Eles evoluíram emocionalmente.
---

# Explicação Detalhada

A função `append()` adiciona elementos ao final de um slice.

Sempre que necessário, Go cria internamente um novo array maior e copia os elementos.

Essa operação é extremamente comum.

```go
slice = append(slice, valor)
```

Também é possível adicionar vários elementos de uma vez.

# Saída Esperada

[1 2 3 4 5]

Quantidade: 5

# Código

```go
package main

import "fmt"

func main() {
	numeros := []int{1, 2, 3}

	numeros = append(numeros, 4)
	numeros = append(numeros, 5)

	fmt.Println(numeros)
	fmt.Println()
	fmt.Println("Quantidade:", len(numeros))
}
```