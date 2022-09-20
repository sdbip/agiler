import http, { IncomingMessage } from 'http'
import urlParser from 'url'

export type Response = {
  statusCode?: number
  content: string
}

export const get = async (url: string) => {
  return await send('GET', url)
}

export const post = async (url: string, data?: object) => {
  const json = data && JSON.stringify(data)
  return await send('POST', url, json)
}

export const patch = async (url: string, data?: object) => {
  const json = data && JSON.stringify(data)
  return await send('PATCH', url, json)
}

function send(method: string, url: string, body?: string) {
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

  return new Promise<Response>((resolve) => {
    const request = http.request(options, async response => {
      const result = await readResponse(response)
      resolve(result)
    })

    request.end(body)
  })
}

function readResponse(response: IncomingMessage): Promise<Response> {
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
