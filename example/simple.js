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
