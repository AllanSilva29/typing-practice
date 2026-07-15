package main

import "fmt"

func main() {
	contador := 1

	for contador <= 5 {
		fmt.Println("Contador:", contador)
		contador++
	}
}