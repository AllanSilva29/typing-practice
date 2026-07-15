---
name: Métodos
language: go
id: methods
difficulty: medium
category: Structs
comment: Uma função resolveu morar dentro de um tipo. A vizinhança parece ter aprovado.
---

# Explicação Detalhada

Um método é uma função associada a um tipo.

Ele recebe um parâmetro especial chamado **receiver**.

```go
func (p Pessoa) Saudacao() {
    ...
}
```

Isso permite organizar melhor o código e aproximar comportamentos dos dados que eles manipulam.

# Saída Esperada

Olá! Meu nome é Allan.

# Código

```go
package main

import "fmt"

type Pessoa struct {
	Nome string
}

func (p Pessoa) Saudacao() {
	fmt.Println("Olá! Meu nome é", p.Nome+".")
}

func main() {
	pessoa := Pessoa{
		Nome: "Allan",
	}

	pessoa.Saudacao()
}
```