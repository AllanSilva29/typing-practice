package main

import "fmt"

func main() {
	var valor any = "Olá, Go!"

	texto, ok := valor.(string)

	if ok {
		fmt.Println("Texto recebido:", texto)
	}
}