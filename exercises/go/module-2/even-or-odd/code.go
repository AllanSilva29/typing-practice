package main

import "fmt"

func main() {
	numero := 17

	fmt.Println("Número:", numero)
	fmt.Println()

	if numero%2 == 0 {
		fmt.Println("O número é par.")
	} else {
		fmt.Println("O número é ímpar.")
	}
}