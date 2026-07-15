package main

import "fmt"

func saudar(nome string) {
	fmt.Println("Olá,", nome+"!")
}

func main() {
	saudar("Gopher")
	saudar("Allan")
}