'use strict'

const expect = require('chai').expect
const http = require('http')
const server = require('../src/server')

describe('server', () => {

  before(() => {
    server.listenAtPort(8080)
  })

  after(() => {
    server.stopListening()
  })

  it('responds', (done) => {
    http.get('http://localhost:8080', response => {
      expect(response.statusCode).to.equal(200)
      done()
    })
  })

  it('can start and stop multiple times', (done) => {
    for (let i = 0; i < 5; i++) {
      server.stopListening()
      server.listenAtPort(8080)
    }
    http.get('http://localhost:8080', response => {
      expect(response.statusCode).to.equal(200)
      done()
    })
  })

})
