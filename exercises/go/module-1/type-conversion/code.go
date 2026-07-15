package main

import "fmt"

func main() {
	valor := 42

	convertido := float64(valor)

	fmt.Println("Valor inteiro:", valor)
	fmt.Println("Valor convertido:", convertido)
	fmt.Println("Valor convertido + 0.5:", convertido+0.5)
}