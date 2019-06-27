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

let DB = aws.DynamoDB
let endpoint = new aws.Endpoint('http://localhost:5000')

module.exports = process.env.NODE_ENV === 'testing'? new DB({endpoint}) : new DB
