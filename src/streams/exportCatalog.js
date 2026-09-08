const { Transform } = require('node:stream');
class PerfumeCsvTransformer extends Transform {
  constructor() { super({ objectMode: true }); }
  _transform(chunk, encoding, callback) {
    this.push(`${chunk.id},${chunk.name},${chunk.price}\n`);
    callback();
  }
}
module.exports = { PerfumeCsvTransformer };
