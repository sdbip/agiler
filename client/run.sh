node -e "\
  const backend = require('./src/backend.js'); \
  backend.setRepository(new (require('./src/inmem.js'))());
  backend.listenAtPort(8080); \
  require('./src/client.js').listenAtPort(80); \
  console.log('Ready')"
