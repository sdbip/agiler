'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
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
      response.setEncoding('utf-8')
      response.on('data', (content) => {
        assert.isOk(content)
      })
      response.on('end', done) // TODO: This triggers extra error if the test fails
    })
  })

  it('yields an error if stopping twice', (done) => {
    server.stopListening()
    server.stopListening((error) => {
      if (!error) assert.fail()
      done()
    })
  })

  it('throws if port number is missing', () => {
    expect(() => server.listenAtPort()).to.throw()
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
