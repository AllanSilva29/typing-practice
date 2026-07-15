---
name: Operadores Aritméticos
language: go
id: arithmetic-operators
difficulty: easy
category: Operadores
comment: Computadores foram inventados para fazer contas rapidamente. O resto veio como consequência.
---

# Explicação Detalhada

Go possui os operadores matemáticos mais comuns:

- `+` soma
- `-` subtração
- `*` multiplicação
- `/` divisão
- `%` resto da divisão

Eles funcionam da maneira esperada para números inteiros e de ponto flutuante.

Neste exercício calculamos diversas operações utilizando dois números.

# Saída Esperada

Soma: 18

Subtração: 6

Multiplicação: 72

Divisão: 2

Resto: 0

# Código

```go
package main

import "fmt"

func main() {
	a := 12
	b := 6

	fmt.Println("Soma:", a+b)
	fmt.Println("Subtração:", a-b)
	fmt.Println("Multiplicação:", a*b)
	fmt.Println("Divisão:", a/b)
	fmt.Println("Resto:", a%b)
}
```