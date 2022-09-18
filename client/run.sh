node -e "\
  require('./src/client.js').listenAtPort(80); \
  require('./src/backend.js').listenAtPort(8080); \
  console.log('Ready')"
