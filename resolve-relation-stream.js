module.exports = ResolveRelation

var TransformStream = require('stream').Transform

function ResolveRelation(readFn, propertyName, objectName) {
  if (typeof readFn !== 'function') throw new TypeError('readFn is expected to be a function')
  if (!propertyName) throw new TypeError('propertyName is expected')
  this.readFn = readFn
  TransformStream.call(this)
  this._writableState.objectMode = true
  this._readableState.objectMode = true
  this.propertyName = propertyName
  this.objectName = objectName || ('_' + this.propertyName.replace(/Id$/, ''))
}

ResolveRelation.prototype = Object.create(TransformStream.prototype)

ResolveRelation.prototype._transform = function (data, encoding, callback) {
  this.readFn(data[this.propertyName], (function(error, entity) {
    if (error) return this.emit('error', error)
    if (entity) data[this.objectName] = entity
    this.push(data)
    callback()
  }).bind(this))
}
