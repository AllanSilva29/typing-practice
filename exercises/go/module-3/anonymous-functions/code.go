package main

import "fmt"

func main() {
	saudacao := func() {
		fmt.Println("Olá do mundo das funções anônimas!")
	}

	saudacao()
}