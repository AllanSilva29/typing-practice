---
name: Funções
language: go
id: functions
difficulty: easy
category: Funções
comment: Finalmente você pode parar de copiar o mesmo código dez vezes. Seu teclado agradece.
---

# Explicação Detalhada

Funções permitem agrupar instruções que executam uma tarefa específica.

Uma função é declarada utilizando a palavra-chave `func`.

Depois de criada, ela pode ser chamada quantas vezes forem necessárias.

Isso reduz repetição de código e facilita manutenção.

# Saída Esperada

Olá, Gopher!

Olá, Allan!

# Código

```go
package main

import "fmt"

func saudar(nome string) {
	fmt.Println("Olá,", nome+"!")
}

func main() {
	saudar("Gopher")
	saudar("Allan")
}
```