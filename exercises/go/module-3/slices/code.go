package main

import "fmt"

func main() {
	nomes := []string{
		"Ana",
		"Carlos",
		"Maria",
	}

	fmt.Println("Primeiro:", nomes[0])
	fmt.Println("Quantidade:", len(nomes))
	fmt.Println(nomes)
}