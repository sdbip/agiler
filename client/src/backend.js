const { setupServer } = require('./server')

const server = setupServer()
let repository

server.get('/tasks', async (_, response) => {
  setBody(response, repository.getAll())
})

server.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  repository.add(taskDTO)
  setBody(response, taskDTO)
})

const s = server.finalize()
module.exports.setRepository = r => {repository = r}
module.exports.listenAtPort = s.listenAtPort.bind(s)
module.exports.stopListening = s.stopListening.bind(s)

function readBody(request) {
  return new Promise((resolve, reject) => {
    request.setEncoding('utf-8')
    let body = ''
    request.on('data', data => { body += data })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject({ error: error.toString() })
      }
    })
  })
}

function setBody(response, object) {
  response.end(JSON.stringify(object))
}

