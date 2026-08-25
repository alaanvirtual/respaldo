const http = require('node:http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'success', message: 'Servidor HTTP nativo inicializado' }));
});
server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
