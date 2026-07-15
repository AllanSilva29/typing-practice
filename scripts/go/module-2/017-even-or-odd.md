---
name: Número Par ou Ímpar
language: go
id: even-or-odd
difficulty: easy
category: Exercícios
comment: O primeiro programa que realmente toma uma decisão útil. Ainda não vai revolucionar a computação, mas já é um avanço.
---

# Explicação Detalhada

O operador `%` retorna o resto de uma divisão.

Quando um número é dividido por 2:

- resto igual a 0 → número par;
- resto diferente de 0 → número ímpar.

Esse é um dos usos mais comuns do operador de módulo.

# Saída Esperada

Número: 17

O número é ímpar.

# Código

```go
package main

import "fmt"

func main() {
	numero := 17

	fmt.Println("Número:", numero)
	fmt.Println()

	if numero%2 == 0 {
		fmt.Println("O número é par.")
	} else {
		fmt.Println("O número é ímpar.")
	}
}
```