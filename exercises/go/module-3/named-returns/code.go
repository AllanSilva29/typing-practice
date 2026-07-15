package main

import "fmt"

func retangulo(base, altura int) (area int, perimetro int) {
	area = base * altura
	perimetro = (base + altura) * 2
	return
}

func main() {
	area, perimetro := retangulo(10, 5)

	fmt.Println("Área:", area)
	fmt.Println("Perímetro:", perimetro)
}