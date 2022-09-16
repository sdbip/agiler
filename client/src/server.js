const http = require('http');
module.exports = {
  start: (port) => {
    const server = http.createServer();
    server.on('request', (request, response) => {
      response.end('foo');
    });
    server.listen(port);
  },
};
