---
name: Múltiplos Retornos
language: go
id: multiple-returns
difficulty: medium
category: Funções
comment: Go resolveu que uma função pode devolver mais de uma resposta. Surpreendentemente, isso costuma facilitar as coisas.
---

# Explicação Detalhada

Uma característica marcante de Go é que funções podem retornar vários valores.

Essa funcionalidade é amplamente utilizada na biblioteca padrão, principalmente para retornar um resultado e um possível erro.

Neste exercício criamos uma função que retorna a soma e a multiplicação de dois números.

# Saída Esperada

Soma: 10

Multiplicação: 24

# Código

```go
package main

import "fmt"

func calcular(a int, b int) (int, int) {
	soma := a + b
	multiplicacao := a * b

	return soma, multiplicacao
}

func main() {
	soma, multiplicacao := calcular(4, 6)

	fmt.Println("Soma:", soma)
	fmt.Println("Multiplicação:", multiplicacao)
}
```