---
name: Parâmetros
language: go
id: function-parameters
difficulty: easy
category: Funções
comment: A função faz o trabalho. Os parâmetros dizem exatamente qual trabalho ela deve fazer. É quase uma reunião produtiva.
---

# Explicação Detalhada

Parâmetros são valores recebidos por uma função.

Eles tornam uma função reutilizável, permitindo que ela trabalhe com diferentes dados sem alterar sua implementação.

Neste exercício a função recebe dois números e calcula sua soma.

# Saída Esperada

8 + 5 = 13

20 + 7 = 27

# Código

```go
package main

import "fmt"

func somar(a int, b int) {
	fmt.Println(a, "+", b, "=", a+b)
}

func main() {
	somar(8, 5)
	somar(20, 7)
}
```