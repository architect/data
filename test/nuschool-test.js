var test = require('tape')
var parallel = require('run-parallel')
var data = require('../')
var arc = require('@architect/workflows')
var path = require('path')

test('env', t=> {
  t.plan(1)
  t.ok(data, 'got data')
})

// major 🔑 because sandbox looks for .arc in cwd
process.chdir(__dirname)

var server
test('starts the db server', t=> {
  t.plan(1)
  server = arc.sandbox.db.start(x=> {
    t.ok(true, 'started db server')
  })
})

var testapp
test('put', async t=>{
  t.plan(6)
  console.time('data() invocation')
  testapp = data() // reads .arc 
  console.timeEnd('data() invocation')
  t.ok(testapp, 'got data')
  t.ok(testapp.hashids, 'has hashids defined')
  console.log(testapp)
  t.ok(testapp._name, 'testqpp._name exists')
  t.ok(testapp._db, 'testqpp._db exists')
  t.ok(testapp._doc, 'testqpp._doc exists')
  var item = await testapp.hashids.put({
    id: 'fake',
    foo: 'bar', 
    baz: {
      one: 1,
      doe: true
    }
  }) 
  t.ok(item, 'returned item')
  console.log(item)
})

test('get', async t=> {
  t.plan(2)
  var result = await testapp.hashids.get({
    id: 'fake'
  }) 
  t.ok(result, 'got result')
  t.ok(result.baz.doe, 'result.baz.doe deserialized')
  console.log(result)
})

test('delete', async t=> {
  t.plan(2)
  await testapp.hashids.delete({
    id: 'fake'
  }) 
  t.ok(true, 'deleted')
  var result = await testapp.hashids.get({
    id: 'fake'
  }) 
  t.ok(typeof result === 'undefined', 'got undefined result')
  console.log(result)
})

test('query', async t=> {
  t.plan(3)
  var items = await Promise.all([
    testapp.hashids.put({id: 'one'}),
    testapp.hashids.put({id: 'two'}),
    testapp.hashids.put({id: 'three'}),
  ])

  t.ok(items, 'got items')

  var result = await testapp.hashids.query({
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': 'one',
    }
  })

  t.ok(result, 'got a result')
  t.ok(result.Count === 1, 'got one')
  console.log(result)
})

test('scan', async t=> {
  t.plan(1)
  var result = await testapp.hashids.scan({
    FilterExpression : 'id = :id',
    ExpressionAttributeValues : {
      ':id' : 'two'
    }  
  })
  t.ok(result, 'got a result')
  console.log(result)
})

test('update', async t=> {
  t.plan(3)
  await testapp.hashids.update({
    Key: { 
      id: 'three' 
    },
    UpdateExpression: 'set #hits = :hits', 
    ExpressionAttributeNames: {
      '#hits' : 'hits'
    },
    ExpressionAttributeValues: {
      ':hits' : 20,
    }
  })

  t.ok(true, 'updated without error')

  var result = await testapp.hashids.get({
    id: 'three'
  })

  t.ok(result, 'got result')
  t.ok(result.hits === 20, '20 hits')
  console.log(result)      
})

test('server closes', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})
