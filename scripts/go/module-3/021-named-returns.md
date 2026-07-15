---
name: Retornos Nomeados
language: go
id: named-returns
difficulty: medium
category: Funções
comment: Dar nome aos retornos pode deixar o código mais claro. Ou mais confuso. Use com moderação, como cafeína.
---

# Explicação Detalhada

Em Go, os valores de retorno podem receber nomes.

Esses nomes funcionam como variáveis locais da função e podem ser retornados apenas com a palavra `return`.

Embora seja um recurso útil em algumas situações, principalmente em funções curtas, seu uso excessivo pode reduzir a legibilidade.

# Saída Esperada

Área: 50

Perímetro: 30

# Código

```go
package main

import "fmt"

func retangulo(base, altura int) (area int, perimetro int) {
	area = base * altura
	perimetro = (base + altura) * 2
	return
}

func main() {
	area, perimetro := retangulo(10, 5)

	fmt.Println("Área:", area)
	fmt.Println("Perímetro:", perimetro)
}
```