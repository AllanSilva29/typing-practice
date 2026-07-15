---
name: Operadores Relacionais
language: go
id: relational-operators
difficulty: easy
category: Operadores
comment: Agora o programa pode comparar valores. Julgar pessoas ainda continua sendo responsabilidade sua.
---

# Explicação Detalhada

Operadores relacionais retornam valores booleanos (`true` ou `false`).

Os principais são:

- `==`
- `!=`
- `>`
- `<`
- `>=`
- `<=`

Esses operadores são utilizados principalmente em estruturas condicionais como `if`, que será apresentada no próximo exercício.

# Saída Esperada

A é maior que B? true

A é menor que B? false

A é igual a B? false

A é diferente de B? true

# Código

```go
package main

import "fmt"

func main() {
	a := 15
	b := 10

	fmt.Println("A é maior que B?", a > b)
	fmt.Println("A é menor que B?", a < b)
	fmt.Println("A é igual a B?", a == b)
	fmt.Println("A é diferente de B?", a != b)
}
```