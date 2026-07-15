---
name: Arrays
language: go
id: arrays
difficulty: medium
category: Coleções
comment: Um array possui tamanho fixo. Ele é extremamente organizado e igualmente inflexível.
---

# Explicação Detalhada

Um array é uma sequência de elementos do mesmo tipo com tamanho definido em tempo de compilação.

Sua sintaxe é:

```go
var numeros [5]int
```

ou

```go
numeros := [5]int{10, 20, 30, 40, 50}
```

O tamanho faz parte do tipo. Um `[5]int` é diferente de um `[10]int`.

Por esse motivo, arrays são menos utilizados que slices em Go, embora ainda sejam importantes para compreender o funcionamento da linguagem.

# Saída Esperada

Primeiro: 10

Último: 50

Array completo: [10 20 30 40 50]

# Código

```go
package main

import "fmt"

func main() {
	numeros := [5]int{10, 20, 30, 40, 50}

	fmt.Println("Primeiro:", numeros[0])
	fmt.Println("Último:", numeros[4])
	fmt.Println("Array completo:", numeros)
}
```