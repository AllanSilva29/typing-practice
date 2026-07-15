---
name: Tipos Básicos
language: go
id: basic-types
difficulty: easy
category: Básico
comment: Existem muitos tipos na programação. Felizmente Go decidiu não transformar isso em um zoológico.
---

# Explicação Detalhada

Go possui diversos tipos primitivos. Os mais utilizados são:

- `int` para números inteiros;
- `float64` para números com casas decimais;
- `bool` para valores lógicos (`true` ou `false`);
- `string` para textos.

Cada variável possui um tipo definido em tempo de compilação. Isso ajuda o compilador a detectar erros antes mesmo do programa ser executado.

Neste exercício veremos como armazenar diferentes tipos de dados e imprimi-los.

# Saída Esperada

Nome: Gopher

Idade: 15

Nota: 9.8

Aprovado: true

# Código

```go
package main

import "fmt"

func main() {
	nome := "Gopher"
	idade := 15
	nota := 9.8
	aprovado := true

	fmt.Println("Nome:", nome)
	fmt.Println("Idade:", idade)
	fmt.Println("Nota:", nota)
	fmt.Println("Aprovado:", aprovado)
}
```