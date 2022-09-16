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
