---
name: Receiver por Ponteiro
language: go
id: pointer-receiver
difficulty: medium
category: Structs
comment: Modificar uma struct sem ponteiros funciona tão bem quanto editar uma fotocópia esperando mudar o original.
---

# Explicação Detalhada

Métodos podem receber structs por valor ou por ponteiro.

Quando utilizamos um receiver por valor, a struct é copiada.

Quando utilizamos um receiver por ponteiro, o método altera a struct original.

Essa é a forma mais comum para métodos que modificam o estado de um objeto.

# Saída Esperada

Nova idade: 26

# Código

```go
package main

import "fmt"

type Pessoa struct {
	Nome  string
	Idade int
}

func (p *Pessoa) Aniversario() {
	p.Idade++
}

func main() {
	pessoa := Pessoa{
		Nome:  "Allan",
		Idade: 25,
	}

	pessoa.Aniversario()

	fmt.Println("Nova idade:", pessoa.Idade)
}
```