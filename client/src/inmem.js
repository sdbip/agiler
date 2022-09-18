class InMem {
  items = []
  
  getAll() { return this.items }
  add(item) { this.items.push(item) }
}

module.exports = InMem
