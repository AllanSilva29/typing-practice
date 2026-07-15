---
name: Maps
language: go
id: maps
difficulty: medium
category: Coleções
comment: Finalmente uma estrutura que encontra informações sem você precisar decorar onde elas estão escondidas.
---

# Explicação Detalhada

Maps armazenam pares de chave e valor.

São equivalentes aos dicionários de Python ou aos objetos associativos encontrados em outras linguagens.

Um map pode ser criado utilizando `make()`.

```go
idades := make(map[string]int)
```

Também é possível inicializá-lo diretamente.

Neste exercício armazenamos nomes e respectivas idades.

# Saída Esperada

Allan: 25

Maria: 31

João: 28

# Código

```go
package main

import "fmt"

func main() {
	idades := map[string]int{
		"Allan": 25,
		"Maria": 31,
		"João":  28,
	}

	fmt.Println("Allan:", idades["Allan"])
	fmt.Println("Maria:", idades["Maria"])
	fmt.Println("João:", idades["João"])
}
```