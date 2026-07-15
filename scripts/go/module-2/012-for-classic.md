---
name: For Clássico
language: go
id: classic-for
difficulty: easy
category: Laços
comment: Go possui apenas um laço. Felizmente ele faz o trabalho de vários.
---

# Explicação Detalhada

Go possui apenas uma estrutura de repetição: o `for`.

A forma clássica é:

```go
for inicializacao; condicao; incremento {
	// código
}
```

Ela funciona de maneira semelhante ao `for` encontrado em outras linguagens.

Neste exercício imprimimos os números de 1 a 5.

# Saída Esperada

1

2

3

4

5

# Código

```go
package main

import "fmt"

func main() {
	for i := 1; i <= 5; i++ {
		fmt.Println(i)
	}
}
```