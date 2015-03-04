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
