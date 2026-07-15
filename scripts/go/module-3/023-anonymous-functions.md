---
name: Funções Anônimas
language: go
id: anonymous-functions
difficulty: medium
category: Funções
comment: Às vezes uma função é importante o suficiente para existir. Mas não importante o bastante para ganhar um nome.
---

# Explicação Detalhada

Uma função anônima é criada sem receber um nome.

Ela pode ser armazenada em uma variável ou executada imediatamente.

Esse recurso é frequentemente utilizado junto com goroutines e callbacks.

# Saída Esperada

Olá do mundo das funções anônimas!

# Código

```go
package main

import "fmt"

func main() {
	saudacao := func() {
		fmt.Println("Olá do mundo das funções anônimas!")
	}

	saudacao()
}
```