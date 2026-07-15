package main

import "fmt"

type Animal interface {
	Som() string
}

type Cachorro struct{}

func (c Cachorro) Som() string {
	return "Au Au!"
}

func apresentar(a Animal) {
	fmt.Println("O cachorro faz:", a.Som())
}

func main() {
	c := Cachorro{}
	apresentar(c)
}