package main

import "fmt"

func somar(a int, b int) {
	fmt.Println(a, "+", b, "=", a+b)
}

func main() {
	somar(8, 5)
	somar(20, 7)
}