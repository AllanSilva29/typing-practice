package main

import "fmt"

func main() {
	linguagens := []string{
		"Go",
		"Rust",
		"Python",
		"Java",
	}

	for indice, linguagem := range linguagens {
		fmt.Println(indice, "->", linguagem)
	}
}