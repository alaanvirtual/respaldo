const { URL } = require('node:url');
class Router {
  constructor() {
    this.routes = { GET: new Map(), POST: new Map(), PUT: new Map(), DELETE: new Map() };
  }
  get(path, handler) { this.routes.GET.set(path, handler); }
  post(path, handler) { this.routes.POST.set(path, handler); }
  parseJsonBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(data ? JSON.parse(data) : {}); }
        catch (e) { reject({ statusCode: 400, message: 'JSON malformado' }); }
      });
      req.on('error', reject);
    });
  }
}
module.exports = Router;
