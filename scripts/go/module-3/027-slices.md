---
name: Slices
language: go
id: slices
difficulty: medium
category: Coleções
comment: Se arrays são apartamentos, slices são apartamentos com parede removível. Muito mais flexíveis.
---

# Explicação Detalhada

Slices são a principal estrutura de coleção utilizada em Go.

Eles funcionam como uma visão sobre um array, mas possuem tamanho variável.

Um slice é declarado assim:

```go
nomes := []string{"Ana", "Carlos", "Maria"}
```

Na prática, a maior parte dos programas Go utiliza slices em vez de arrays.

# Saída Esperada

Primeiro: Ana

Quantidade: 3

[Ana Carlos Maria]

# Código

```go
package main

import "fmt"

func main() {
	nomes := []string{
		"Ana",
		"Carlos",
		"Maria",
	}

	fmt.Println("Primeiro:", nomes[0])
	fmt.Println("Quantidade:", len(nomes))
	fmt.Println(nomes)
}
```