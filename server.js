const http = require('node:http');
const fs = require('node:fs');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (url === '/event-loop/async') {
    fs.readFile(__filename, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', type: 'I/O Asincrono No Bloqueante', bytes: data.length }));
    });
    return;
  }
  if (url === '/event-loop/blocking') {
    let count = 0;
    for (let i = 0; i < 30000000; i++) count += i;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'success', type: 'Calculo Bloqueante', count }));
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'success', system: 'BL FRAGANCIAS API', version: 'v1.0.0-http-core' }));
});
server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
