'use strict'

const expect = require('chai').expect
const http = require('http')
const server = require('../src/server')

describe('server', () => {

  it('finds the server', (done) => {
    server.start(8080)
    http.get('http://localhost:8080', response => {
      expect(response.statusCode).to.equal(200)
      done()
    })
  })

})
