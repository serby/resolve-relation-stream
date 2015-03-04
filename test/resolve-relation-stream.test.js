var assert = require('assert')
  , streamArray = require('stream-array')
  , streamAssert = require('stream-assert')
  , ResolveRelationStream = require('..')
  , Stream = require('stream').Stream
  , contacts =
    { 1: { name: 'Paul' }
    , 2: { name: 'Jim' }
    , 3: { name: 'Bob' }
    }
  , nonRelationalData =
    [ { a: 1 }
    , { a: 2 }
    , { b: 3 }
    ]
  , relationalData =
    [ { a: 1, contactId: 3 }
    , { a: 2, contactId: 2 }
    , { a: 3, contactId: 1 }
    ]

function read(id, cb) {
  cb(null, contacts[id])
}

describe('resolve-relation-stream', function() {

  it('should require a readFn()', function() {
    assert.throws(function() {
      var resolveRelationStream = new ResolveRelationStream()
      resolveRelationStream = resolveRelationStream
    }, /readFn is expected to be a function/)
  })

  it('should require a propertyName', function() {
    assert.throws(function() {
      var resolveRelationStream = new ResolveRelationStream(read)
      resolveRelationStream = resolveRelationStream
    }, /propertyName is expected/)
  })

  it('should be a stream', function() {
    var resolveRelationStream = new ResolveRelationStream(read, 'contactId')
    assert(resolveRelationStream instanceof Stream)
  })

  it('should not mutate stream without propertyName', function() {
    var resolveRelationStream = new ResolveRelationStream(read, 'contactId')
    streamArray(nonRelationalData)
      .pipe(resolveRelationStream)
      .pipe(streamAssert.first(function(data) { assert.equal(data, nonRelationalData[0]) }))
      .pipe(streamAssert.second(function(data) { assert.equal(data, nonRelationalData[1]) }))
      .pipe(streamAssert.nth(3, function(data) { assert.equal(data, nonRelationalData[2]) }))
      .pipe(streamAssert.end())
  })

  it('should mutate object stream if property found', function() {
    var resolveRelationStream = new ResolveRelationStream(read, 'contactId')
    streamArray(relationalData)
      .pipe(resolveRelationStream)
      .pipe(streamAssert.first(function(data) { assert.equal(data._contact.name, 'Bob') }))
      .pipe(streamAssert.second(function(data) { assert.equal(data._contact.name, 'Jim') }))
      .pipe(streamAssert.nth(3, function(data) { assert.equal(data._contact.name, 'Paul') }))
      .pipe(streamAssert.end())
  })

  it('should resolved object if not found with read()', function() {
    var resolveRelationStream = new ResolveRelationStream(read, 'contactId')
    streamArray([ { contact: 999 } ])
      .pipe(resolveRelationStream)
      .pipe(streamAssert.first(function(data) { assert.equal(data._contact, undefined) }))
      .pipe(streamAssert.end())
  })

  it('should use objectName if provided', function() {
    var resolveRelationStream = new ResolveRelationStream(read, 'contactId', 'theContact')
    streamArray([ { contact: 1 } ])
      .pipe(resolveRelationStream)
      .pipe(streamAssert.first(function(data) { assert.equal(data.theContact.name, 'Paul') }))
      .pipe(streamAssert.end())
  })
})
