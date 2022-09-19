import http from 'http'
import urlParser from 'url'

export const get = async (url) => {
  return await send('GET', url)
}

export const post = async (url, data) => {
  const json = JSON.stringify(data)
  return await send('POST', url, json)
}

function send(method, url, body) {
  const { hostname, port, path } = urlParser.parse(url)
  const options = {
    hostname,
    port,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body?.length ?? 0,
    },
  }
  return new Promise((resolve) => {
    const request = http.request(options, async response => {
      const result = await readResponse(response)
      resolve(result)
    })

    request.end(body)
  })
}

function readResponse(response) {
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
