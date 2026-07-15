package main

import "fmt"

func soma(valores ...int) int {
	total := 0

	for _, valor := range valores {
		total += valor
	}

	return total
}

func main() {
	fmt.Println("Soma:", soma(1, 2, 3, 4, 5))
}