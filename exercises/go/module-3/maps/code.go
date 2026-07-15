package main

import "fmt"

func main() {
	idades := map[string]int{
		"Allan": 25,
		"Maria": 31,
		"João":  28,
	}

	fmt.Println("Allan:", idades["Allan"])
	fmt.Println("Maria:", idades["Maria"])
	fmt.Println("João:", idades["João"])
}