---
name: Type Assertion
language: go
id: type-assertion
difficulty: medium
category: Interfaces
comment: Você disse que aceitava qualquer tipo. Agora precisa descobrir o que realmente recebeu.
---

# Explicação Detalhada

Quando trabalhamos com `any` ou `interface{}`, podemos recuperar o tipo original utilizando uma *type assertion*.

A forma segura retorna dois valores:

```go
valor, ok := dado.(string)
```

Se `ok` for `true`, a conversão foi realizada com sucesso.

# Saída Esperada

Texto recebido: Olá, Go!

# Código

```go
package main

import "fmt"

func main() {
	var valor any = "Olá, Go!"

	texto, ok := valor.(string)

	if ok {
		fmt.Println("Texto recebido:", texto)
	}
}
```