const http = require('http')

module.exports.get = (url) => {
  return new Promise((resolve) => {
    http.get(url, async response => {
      const result = await readResponse(response)
      resolve(result)
    })
  })
}

module.exports.post = (url, data) => {
  const { hostname, port, path } = require('url').parse(url)
  return new Promise((resolve) => {
    const json = JSON.stringify(data)
    const options = {
      hostname,
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': json.length,
      },
    }
    const request = http.request(options, async response => {
      const result = await readResponse(response)
      resolve(result)
    })

    request.write(json)
  })
}

function readResponse(response, resolve) {
  return new Promise((resolve) => {
    let result = ''
    response.setEncoding('utf-8')
    response.on('data', (content) => {
      result += content
    })
    response.on('end', () => {
      resolve({
        statusCode: response.statusCode,
        content: result,
      })
    })
  })
}
