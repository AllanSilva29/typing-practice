package main

import "fmt"

func main() {
	if true {
		mensagem := "Esta variável existe apenas aqui."

		fmt.Println("Entrou no bloco.")
		fmt.Println(mensagem)
	}

	fmt.Println("Fim do programa.")
}