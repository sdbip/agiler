class InMem {
  items = []
  
  getAll() { return this.items }
  add(item) { this.items.push(item) }
}

export default InMem
