---
name: Conversão de Tipos
language: go
id: type-conversion
difficulty: easy
category: Básico
comment: Diferente de algumas linguagens, Go prefere que você diga exatamente o que está fazendo. Preguiça de converter tipos não é argumento.
---

# Explicação Detalhada

Go não realiza conversões automáticas entre tipos numéricos.

O código abaixo gera erro:

```go
var idade int = 20
var altura float64 = idade
```

A conversão deve ser feita explicitamente.

```go
altura := float64(idade)
```

Isso evita conversões inesperadas e torna o código mais previsível.

Neste exercício convertemos um número inteiro para ponto flutuante antes de utilizá-lo.

# Saída Esperada

Valor inteiro: 42

Valor convertido: 42

Valor convertido + 0.5: 42.5

# Código

```go
package main

import "fmt"

func main() {
	valor := 42

	convertido := float64(valor)

	fmt.Println("Valor inteiro:", valor)
	fmt.Println("Valor convertido:", convertido)
	fmt.Println("Valor convertido + 0.5:", convertido+0.5)
}
```