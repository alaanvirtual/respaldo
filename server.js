const http = require('node:http');
const Router = require('./src/router');
const PORT = process.env.PORT || 3000;
const router = new Router();
const catalog = [{ id: '1', name: 'Bleu de Chanel', price: 3650 }];

router.get('/api/perfumes', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'success', data: catalog }));
});
const server = http.createServer(async (req, res) => {
  try {
    const handler = router.routes[req.method]?.get(req.url);
    if (handler) return await handler(req, res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'No encontrado' }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Error interno' }));
  }
});
server.listen(PORT, () => console.log(`Servidor en ${PORT}`));
