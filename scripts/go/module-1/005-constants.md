---
name: Constantes
language: go
id: constants
difficulty: easy
category: Básico
comment: Algumas coisas nunca mudam. As constantes são uma delas. A documentação também espera que você não tente convencê-las do contrário.
---

# Explicação Detalhada

Constantes representam valores que nunca poderão ser alterados durante a execução do programa.

Elas são declaradas utilizando a palavra-chave `const`.

```go
const pi = 3.14159
```

Ao contrário das variáveis, uma constante não pode receber um novo valor posteriormente.

Constantes são ideais para representar informações fixas, como valores matemáticos, limites conhecidos ou textos que nunca serão modificados.

# Saída Esperada

Pi: 3.1415926535

Linguagem: Go

# Código

```go
package main

import "fmt"

const Pi = 3.1415926535
const Linguagem = "Go"

func main() {
	fmt.Println("Pi:", Pi)
	fmt.Println("Linguagem:", Linguagem)
}
```