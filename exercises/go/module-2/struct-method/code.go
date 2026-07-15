type Rect struct {
    width, height float64
}

func (r Rect) Area() float64 {
    return r.width * r.height
}
