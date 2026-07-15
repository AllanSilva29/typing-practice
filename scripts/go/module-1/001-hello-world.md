---
name: Hello World
language: go
id: hello-world
difficulty: easy
category: Básico
comment: Seu primeiro programa em Go. Sim, ele imprime uma frase. Não subestime o clássico.
---

# Explicação Detalhada

Todo programa Go começa pelo pacote `main`. É ele que indica ao compilador que este arquivo gera um programa executável.

A função `main()` é o ponto de entrada da aplicação. Quando você executa o programa, é nela que tudo começa.

Para escrever texto no terminal usamos o pacote `fmt`, que significa "format".

Neste exercício você conhecerá apenas a estrutura mínima necessária para executar um programa em Go.

Apesar de extremamente simples, praticamente todos os programas da linguagem começam exatamente dessa forma.

# Saída Esperada

Hello, World!

# Código

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}
```