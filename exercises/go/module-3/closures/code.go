package main

import "fmt"

func contador() func() int {
	valor := 0

	return func() int {
		valor++
		return valor
	}
}

func main() {
	proximo := contador()

	fmt.Println(proximo())
	fmt.Println(proximo())
	fmt.Println(proximo())
}