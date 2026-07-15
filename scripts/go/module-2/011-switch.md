---
name: Switch
language: go
id: switch
difficulty: easy
category: Controle de Fluxo
comment: Uma alternativa elegante para quando seu if else começa a parecer uma árvore genealógica.
---

# Explicação Detalhada

A estrutura `switch` permite executar diferentes blocos de código com base no valor de uma expressão.

Ela substitui sequências longas de `if` e `else if`, tornando o código mais legível.

Em Go, não é necessário utilizar `break` ao final de cada caso.

Neste exercício utilizamos um número para representar um dia da semana.

# Saída Esperada

Dia selecionado: 3

Quarta-feira

# Código

```go
package main

import "fmt"

func main() {
	dia := 3

	fmt.Println("Dia selecionado:", dia)
	fmt.Println()

	switch dia {
	case 1:
		fmt.Println("Segunda-feira")
	case 2:
		fmt.Println("Terça-feira")
	case 3:
		fmt.Println("Quarta-feira")
	case 4:
		fmt.Println("Quinta-feira")
	case 5:
		fmt.Println("Sexta-feira")
	default:
		fmt.Println("Fim de semana")
	}
}
```