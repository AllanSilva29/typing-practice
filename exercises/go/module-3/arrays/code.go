package main

import "fmt"

func main() {
	numeros := [5]int{10, 20, 30, 40, 50}

	fmt.Println("Primeiro:", numeros[0])
	fmt.Println("Último:", numeros[4])
	fmt.Println("Array completo:", numeros)
}