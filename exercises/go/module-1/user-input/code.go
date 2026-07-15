package main

import "fmt"

func main() {
	var nome string

	fmt.Print("Digite seu nome: ")
	fmt.Scan(&nome)

	fmt.Println()
	fmt.Println("Olá,", nome+"!")
}