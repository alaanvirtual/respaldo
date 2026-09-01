const { URL } = require('node:url');
class Router {
  constructor() {
    this.routes = { GET: new Map(), POST: new Map(), PUT: new Map(), DELETE: new Map() };
  }
  get(path, handler) { this.routes.GET.set(path, handler); }
  post(path, handler) { this.routes.POST.set(path, handler); }
}
module.exports = Router;
