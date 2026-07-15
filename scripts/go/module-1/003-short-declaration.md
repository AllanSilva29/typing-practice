---
name: Declaração Curta
language: go
id: short-declaration
difficulty: easy
category: Básico
comment: Se você ainda escreve 'var' para tudo, Go começa a olhar torto para você.
---

# Explicação Detalhada

Go possui uma forma reduzida de declarar variáveis.

Em vez de escrever:

```go
var nome string = "João"
```

você pode simplesmente escrever:

```go
nome := "João"
```

O compilador descobre automaticamente o tipo da variável.

Essa forma é utilizada na maior parte dos códigos escritos em Go.

Ela só pode ser utilizada dentro de funções.

# Saída Esperada

Linguagem: Go

Versão: 1.24

É divertida? true

# Código

```go
package main

import "fmt"

func main() {
	linguagem := "Go"
	versao := 1.24
	divertida := true

	fmt.Println("Linguagem:", linguagem)
	fmt.Println("Versão:", versao)
	fmt.Println("É divertida?", divertida)
}
```