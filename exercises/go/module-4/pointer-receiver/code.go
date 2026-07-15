package main

import "fmt"

type Pessoa struct {
	Nome  string
	Idade int
}

func (p *Pessoa) Aniversario() {
	p.Idade++
}

func main() {
	pessoa := Pessoa{
		Nome:  "Allan",
		Idade: 25,
	}

	pessoa.Aniversario()

	fmt.Println("Nova idade:", pessoa.Idade)
}