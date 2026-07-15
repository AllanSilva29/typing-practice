package main

import "fmt"

func imprimir(valor any) {
	fmt.Println(valor)
}

func main() {
	imprimir(42)
	imprimir("Go")
	imprimir(true)
}