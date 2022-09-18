node -e "\
  require('./src/server.js').listenAtPort(80); \
  require('./src/backend.js').listenAtPort(8080); \
  console.log('Ready')"
