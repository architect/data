let aws = require('aws-sdk')
let http = require('https')

// ensure NODE_ENV
if (typeof process.env.NODE_ENV === 'undefined')
  process.env.NODE_ENV = 'testing'

if (process.env.NODE_ENV != 'testing') {
  let agent = new http.Agent({
    keepAlive: true,
    maxSockets: 50,
    rejectUnauthorized: true,
  })
  aws.config.update({
     httpOptions: {agent}
  })
}

// get a ref to the db
let Doc = aws.DynamoDB.DocumentClient
let endpoint = new aws.Endpoint('http://localhost:5000')

/**
 * NOTE: this file is in the root so devs can cleanly opt into the fastest low level clients
 */
module.exports = process.env.NODE_ENV === 'testing'? new Doc({endpoint}) : new Doc
