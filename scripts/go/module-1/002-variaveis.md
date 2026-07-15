---
name: Variáveis
language: go
id: variables
difficulty: easy
category: Básico
comment: Finalmente algo que muda de valor. A vida também funciona assim.
---

# Explicação Detalhada

Variáveis armazenam informações durante a execução do programa.

Em Go, a palavra-chave `var` declara uma variável.

A sintaxe é:

```go
var nome tipo
```

Você também pode inicializar o valor imediatamente.

```go
var idade int = 25
```

Go possui tipagem estática, então o tipo da variável é conhecido durante a compilação.

Neste exercício declaramos três variáveis de tipos diferentes e imprimimos seus valores.

# Saída Esperada

Nome: Allan

Idade: 25

Altura: 1.78

# Código

```go
package main

import "fmt"

func main() {
	var nome string = "Allan"
	var idade int = 25
	var altura float64 = 1.78

	fmt.Println("Nome:", nome)
	fmt.Println("Idade:", idade)
	fmt.Println("Altura:", altura)
}
```