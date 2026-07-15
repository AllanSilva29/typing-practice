package main

import "fmt"

func identificar(valor any) {
	switch v := valor.(type) {
	case int:
		fmt.Println("Recebi um inteiro:", v)
	case string:
		fmt.Println("Recebi uma string:", v)
	case bool:
		fmt.Println("Recebi um booleano:", v)
	default:
		fmt.Println("Tipo desconhecido.")
	}
}

func main() {
	identificar(10)
	identificar("Go")
	identificar(true)
}