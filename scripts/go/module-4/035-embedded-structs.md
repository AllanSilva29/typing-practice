---
name: Structs Embutidas
language: go
id: embedded-structs
difficulty: medium
category: Structs
comment: Go não acredita em herança tradicional. Preferiu composição e seguiu a vida sem olhar para trás.
---

# Explicação Detalhada

Go incentiva composição em vez de herança.

Uma struct pode conter outra struct.

Quando uma struct é embutida sem nome de campo, seus membros podem ser acessados diretamente.

Essa técnica é chamada de **embedding**.

Ela permite reutilizar funcionalidades mantendo o código simples.

# Saída Esperada

Cidade: Curitiba

Nome: Allan

# Código

```go
package main

import "fmt"

type Endereco struct {
	Cidade string
}

type Pessoa struct {
	Nome string
	Endereco
}

func main() {
	pessoa := Pessoa{
		Nome: "Allan",
		Endereco: Endereco{
			Cidade: "Curitiba",
		},
	}

	fmt.Println("Cidade:", pessoa.Cidade)
	fmt.Println("Nome:", pessoa.Nome)
}
```