---
name: Type Switch
language: go
id: type-switch
difficulty: medium
category: Interfaces
comment: Quando um if não é suficiente para descobrir quem apareceu na festa.
---

# Explicação Detalhada

O *type switch* permite executar diferentes blocos dependendo do tipo concreto armazenado em uma interface.

Sua sintaxe é semelhante ao `switch` tradicional.

É muito utilizado em bibliotecas e frameworks que trabalham com tipos genéricos.

# Saída Esperada

Recebi um inteiro: 10

Recebi uma string: Go

Recebi um booleano: true

# Código

```go
package main

import "fmt"

func identificar(valor any) {
	switch v := valor.(type) {
	case int:
		fmt.Println("Recebi um inteiro:", v)
	case string:
		fmt.Println("Recebi uma string:", v)
	case bool:
		fmt.Println("Recebi um booleano:", v)
	default:
		fmt.Println("Tipo desconhecido.")
	}
}

func main() {
	identificar(10)
	identificar("Go")
	identificar(true)
}
```