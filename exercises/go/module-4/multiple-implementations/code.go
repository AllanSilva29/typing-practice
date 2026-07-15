package main

import "fmt"

type Animal interface {
	Som() string
}

type Cachorro struct{}

func (Cachorro) Som() string {
	return "Au Au!"
}

type Gato struct{}

func (Gato) Som() string {
	return "Miau!"
}

func apresentar(a Animal) {
	fmt.Println("Som:", a.Som())
}

func main() {
	apresentar(Cachorro{})
	apresentar(Gato{})
}