const cluster = require('node:cluster');
const os = require('node:os');
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  process.on('SIGINT', () => {
    for (const id in cluster.workers) cluster.workers[id].kill();
    process.exit(0);
  });
} else {
  require('./server');
}
