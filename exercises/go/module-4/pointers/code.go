package main

import "fmt"

func alterar(numero *int) {
	*numero = 20
}

func main() {
	valor := 10

	fmt.Println("Valor:", valor)

	alterar(&valor)

	fmt.Println("Valor alterado:", valor)
}