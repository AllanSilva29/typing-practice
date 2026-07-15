package main

import "fmt"

func main() {
	dia := 3

	fmt.Println("Dia selecionado:", dia)
	fmt.Println()

	switch dia {
	case 1:
		fmt.Println("Segunda-feira")
	case 2:
		fmt.Println("Terça-feira")
	case 3:
		fmt.Println("Quarta-feira")
	case 4:
		fmt.Println("Quinta-feira")
	case 5:
		fmt.Println("Sexta-feira")
	default:
		fmt.Println("Fim de semana")
	}
}