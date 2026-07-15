---
name: Interfaces
language: go
id: interfaces
difficulty: medium
category: Interfaces
comment: Em Go ninguém precisa pedir permissão para implementar uma interface. Basta fazer o trabalho corretamente.
---

# Explicação Detalhada

Uma interface define um conjunto de métodos.

Qualquer tipo que implemente esses métodos satisfaz automaticamente a interface.

Não existe uma palavra-chave como `implements`.

Esse modelo reduz acoplamento e torna o código mais flexível.

# Saída Esperada

O cachorro faz: Au Au!

# Código

```go
package main

import "fmt"

type Animal interface {
	Som() string
}

type Cachorro struct{}

func (c Cachorro) Som() string {
	return "Au Au!"
}

func apresentar(a Animal) {
	fmt.Println("O cachorro faz:", a.Som())
}

func main() {
	c := Cachorro{}
	apresentar(c)
}
```