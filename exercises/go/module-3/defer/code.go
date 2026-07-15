package main

import "fmt"

func main() {
	defer fmt.Println("Encerrando...")

	fmt.Println("Início da função.")
	fmt.Println("Fim da função.")
}