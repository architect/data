var aws = require('aws-sdk')
var DB = aws.DynamoDB
var endpoint = new aws.Endpoint('http://localhost:5000')
var testing = process.env.NODE_ENV === 'testing'

if (typeof process.env.NODE_ENV === 'undefined') {
  throw ReferenceError('NODE_ENV not defined')
}

if (testing) {
  aws.config.update({
    region: 'us-west-1'
  })
}

module.exports = testing? new DB({endpoint}) : new DB
