const { setupServer } = require('./server')

const server = setupServer()

server.get('/tasks', async (_, response) => {
  setBody(response, [])
})

server.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  setBody(response, taskDTO)
})

module.exports = server.finalize()

function readBody(request) {
  return new Promise((resolve) => {
    request.setEncoding('utf-8')
    let body = ''
    request.on('data', data => { body += data })
    request.on('end', () => resolve(JSON.parse(body)))
  })
}

function setBody(response, object) {
  response.end(JSON.stringify(object))
}

