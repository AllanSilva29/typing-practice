package main

import "fmt"

type Endereco struct {
	Cidade string
}

type Pessoa struct {
	Nome string
	Endereco
}

func main() {
	pessoa := Pessoa{
		Nome: "Allan",
		Endereco: Endereco{
			Cidade: "Curitiba",
		},
	}

	fmt.Println("Cidade:", pessoa.Cidade)
	fmt.Println("Nome:", pessoa.Nome)
}