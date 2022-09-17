const http = require('http')

module.exports.get = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, response => {
      if (response.statusCode !== 200) return reject({
        statusCode: response.statusCode,
      })

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
  })
}

module.exports.post = (url, data) => {
  const { hostname, port, path } = require('url').parse(url)
  return new Promise((resolve, reject) => {
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
    const request = http.request(options, response => {
      if (response.statusCode !== 200) return reject({
        statusCode: response.statusCode,
      })

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
    request.write(json)
  })
}
