package main

import "fmt"

func main() {
	idade := 20

	fmt.Println("Idade:", idade)

	if idade >= 18 {
		fmt.Println("Maior de idade.")
	} else {
		fmt.Println("Menor de idade.")
	}
}