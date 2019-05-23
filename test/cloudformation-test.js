let arc = require('@architect/architect')
let test = require('tape')
let testapp

test('env', t=> {
  t.plan(1)
  process.env.ARC_CLOUDFORMATION = true
  process.env.ARC_TABLE_HASHIDS = 'testapp-staging-hashids'
  process.env.ARC_TABLE_ACCOUNTS = 'testapp-staging-accounts'
  process.env.ARC_TABLE_ACCOUNTSIDENTITIES = 'testapp-staging-accounts-identities'
  process.env.ARC_TABLE_ACCOUNTSVERIFYTOKENS = 'testapp-staging-accounts-verify-tokens'
  process.env.ARC_TABLE_ACCOUNTSPASSWORDRESETTOKENS = 'testapp-staging-accounts-password-reset-tokens'
  /* eslint global-require: off */
  testapp = require('../')
  t.ok(testapp, 'got data')
})

var server
test('starts the db server', t=> {
  t.plan(1)
  server = arc.sandbox.db.start(async function _start() {
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
})

test('server closes', t=> {
  process.env.ARC_CLOUDFORMATION = false
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})
