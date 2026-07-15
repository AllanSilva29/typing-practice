---
name: Structs
language: go
id: structs
difficulty: medium
category: Structs
comment: Finalmente você pode agrupar informações sem criar dez variáveis com nomes parecidos. Sua dignidade agradece.
---

# Explicação Detalhada

Uma `struct` permite agrupar diferentes informações em um único tipo.

Ela é semelhante a uma classe simples em outras linguagens, porém sem herança.

Uma struct pode conter campos de diferentes tipos.

```go
type Pessoa struct {
    Nome  string
    Idade int
}
```

Depois de criada, podemos instanciar novos valores utilizando uma inicialização literal.

Structs são amplamente utilizadas para representar entidades do mundo real.

# Saída Esperada

Nome: Allan

Idade: 25

# Código

```go
package main

import "fmt"

type Pessoa struct {
	Nome  string
	Idade int
}

func main() {
	pessoa := Pessoa{
		Nome:  "Allan",
		Idade: 25,
	}

	fmt.Println("Nome:", pessoa.Nome)
	fmt.Println("Idade:", pessoa.Idade)
}
```