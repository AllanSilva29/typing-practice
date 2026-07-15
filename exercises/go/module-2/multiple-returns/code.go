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