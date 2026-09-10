const { Transform } = require('node:stream');
class PerfumeCsvTransformer extends Transform {
  constructor() { super({ objectMode: true }); this.first = true; }
  _transform(chunk, encoding, callback) {
    if (this.first) { this.push(Buffer.from('ID,NOMBRE,PRECIO\n')); this.first = false; }
    this.push(Buffer.from(`${chunk.id},${chunk.name},${chunk.price}\n`));
    callback();
  }
}
module.exports = { PerfumeCsvTransformer };
