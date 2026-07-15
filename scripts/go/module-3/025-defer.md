---
name: Defer
language: go
id: defer
difficulty: medium
category: Funções
comment: "Faço isso depois." Finalmente uma funcionalidade que representa fielmente o comportamento humano.
---

# Explicação Detalhada

A palavra-chave `defer` agenda uma chamada de função para ser executada quando a função atual terminar.

Ela é muito utilizada para liberar recursos como arquivos, conexões de rede e mutexes.

Mesmo que existam vários `return`, todas as chamadas adiadas serão executadas.

As chamadas `defer` seguem a ordem LIFO (Last In, First Out).

# Saída Esperada

Início da função.

Fim da função.

Encerrando...

# Código

```go
package main

import "fmt"

func main() {
	defer fmt.Println("Encerrando...")

	fmt.Println("Início da função.")
	fmt.Println("Fim da função.")
}
```