# resolve-relation-stream

Object duplex stream that resolves relational properties to full objects.

[![build status](https://secure.travis-ci.org/serby/resolve-relation-stream.png)](http://travis-ci.org/serby/resolve-relation-stream)

## Installation

      npm install resolve-relation-stream

## Usage


### Simple Example

```js

/* Input
{ _id: 54f633a113d6080fd2535f3b,
  name: 'Test',
  contactId: '54f633b813d6080fd2535f3c' }
{ _id: 54f637c713d6080fd2535f3e,
  name: 'Test2',
  contactId: '54f633b813d6080fd2535f3c' }
*/

var ResolveRelationStream = require('..')
  , MongoClient = require('mongodb').MongoClient
  , ObjectId = require('mongodb').ObjectID

MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {

  var contacts = db.collection('contact')
    , blogs = db.collection('blog')
    , resolveRelationStream = new ResolveRelationStream(read, 'contactId')

  function read(id, cb) {
    contacts.findOne({ _id: new ObjectId(id) }, cb)
  }

  blogs.find({}).stream()
    .pipe(resolveRelationStream)
    .on('data', function(data) {
      console.log(data)
    })
    .on('end', function() {
      db.close()
    })

})

/* Output
{ _id: 54f633a113d6080fd2535f3b,
  name: 'Test',
  contactId: '54f633b813d6080fd2535f3c',
  _contact: { _id: 54f633b813d6080fd2535f3c, name: 'Paul Serby' } }
{ _id: 54f637c713d6080fd2535f3e,
  name: 'Test2',
  contactId: '54f633b813d6080fd2535f3c',
  _contact: { _id: '54f633b813d6080fd2535f3c', name: 'Paul Serby' } }
*/

```

### Cached Example

If your relations turn up a lot in your stream then you really should cache your read.

```js

var ResolveRelationStream = require('..')
  , MongoClient = require('mongodb').MongoClient
  , ObjectId = require('mongodb').ObjectID
  , UberCache = require('uber-cache')
  , UberMemoize = require('uber-memoize')
  , cache = new UberCache()
  , uberMemoize = new UberMemoize(cache)

MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {

  var contacts = db.collection('contact')
    , blogs = db.collection('blog')
    , ttl = 50000
    , cachedReadFn = uberMemoize.memoize('readCache', read, ttl)
    , resolveRelationStream = new ResolveRelationStream(cachedReadFn, 'contactId')

  function read(id, cb) {
    console.log('Uncached read', id)
    contacts.findOne({ _id: new ObjectId(id) }, cb)
  }

  blogs.find({}).stream()
    .pipe(resolveRelationStream)
    .on('data', function(data) {
      console.log(data)
    })
    .on('end', function() {
      db.close()
    })

})

```

## Credits
[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
