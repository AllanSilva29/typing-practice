---
name: Múltiplas Implementações
language: go
id: multiple-implementations
difficulty: medium
category: Interfaces
comment: A interface não se importa quem você é. Apenas quer saber se você sabe fazer o trabalho.
---

# Explicação Detalhada

Uma das maiores vantagens das interfaces é permitir que diferentes tipos sejam tratados da mesma forma.

Neste exemplo, `Cachorro` e `Gato` implementam a mesma interface.

A função `apresentar()` pode receber qualquer um deles.

# Saída Esperada

Som: Au Au!

Som: Miau!

# Código

```go
package main

import "fmt"

type Animal interface {
	Som() string
}

type Cachorro struct{}

func (Cachorro) Som() string {
	return "Au Au!"
}

type Gato struct{}

func (Gato) Som() string {
	return "Miau!"
}

func apresentar(a Animal) {
	fmt.Println("Som:", a.Som())
}

func main() {
	apresentar(Cachorro{})
	apresentar(Gato{})
}
```