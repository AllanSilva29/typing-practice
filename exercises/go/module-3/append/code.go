package main

import "fmt"

func main() {
	numeros := []int{1, 2, 3}

	numeros = append(numeros, 4)
	numeros = append(numeros, 5)

	fmt.Println(numeros)
	fmt.Println()
	fmt.Println("Quantidade:", len(numeros))
}