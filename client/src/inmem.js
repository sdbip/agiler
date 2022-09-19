class InMem {
  items = []
  
  async getAll() { return this.items }
  add(item) { this.items.push(item) }
}

export default InMem
