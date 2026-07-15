package main

import "fmt"

type Pessoa struct {
	Nome string
}

func (p Pessoa) Saudacao() {
	fmt.Println("Olá! Meu nome é", p.Nome+".")
}

func main() {
	pessoa := Pessoa{
		Nome: "Allan",
	}

	pessoa.Saudacao()
}