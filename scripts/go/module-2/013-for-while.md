---
name: For Como While
language: go
id: for-while
difficulty: easy
category: Laços
comment: Go não possui while. O for aceitou acumular mais essa responsabilidade.
---

# Explicação Detalhada

Em Go, o `for` também pode ser utilizado como um `while`.

Basta omitir a inicialização e o incremento.

```go
for condicao {
	// código
}
```

O laço continuará executando enquanto a condição for verdadeira.

# Saída Esperada

Contador: 1

Contador: 2

Contador: 3

Contador: 4

Contador: 5

# Código

```go
package main

import "fmt"

func main() {
	contador := 1

	for contador <= 5 {
		fmt.Println("Contador:", contador)
		contador++
	}
}
```