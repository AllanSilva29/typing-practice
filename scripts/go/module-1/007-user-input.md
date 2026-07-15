---
name: Entrada do Usuário
language: go
id: user-input
difficulty: easy
category: Básico
comment: Até agora o programa só falava. Finalmente alguém resolveu escutá-lo.
---

# Explicação Detalhada

Um programa realmente útil normalmente precisa receber informações do usuário.

Em Go, uma das formas mais simples é utilizando `fmt.Scan()`.

Ele lê valores digitados no terminal e os armazena em variáveis.

Como `Scan()` precisa alterar a variável, passamos seu endereço utilizando o operador `&`.

```go
fmt.Scan(&nome)
```

Neste exercício o programa pergunta o nome do usuário e o exibe em seguida.

# Saída Esperada

Digite seu nome:
Allan

Olá, Allan!

# Código

```go
package main

import "fmt"

func main() {
	var nome string

	fmt.Print("Digite seu nome: ")
	fmt.Scan(&nome)

	fmt.Println()
	fmt.Println("Olá,", nome+"!")
}
```