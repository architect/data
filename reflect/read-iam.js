let aws = require('aws-sdk')
let querystring = require('querystring')
let tables = false // cheap cache for tables

module.exports = function readIAM(callback) {
  if (!tables) {
    let iam = new aws.IAM
    let PolicyName = 'ArcDynamoPolicy'
    let RoleName = process.env.ARC_ROLE
    iam.getRolePolicy({
      PolicyName,
      RoleName,
    },
    function done(err, {PolicyDocument}) {
      if (err)
        callback(err)
      else if (!PolicyDocument)
        callback(ReferenceError('ArcDynamoPolicy not found'))
      else {
        try {
          // policydoc is url encoded
          let raw = querystring.unescape(PolicyDocument)
          // and a json string
          let policy = JSON.parse(raw)
          // extract the table arns
          let arns = policy.Statement[0].Resource
          // helper to split the arn and return just the physical table name
          let table = arn=> arn.split('table/')[1]
          // helper to return the tables as: {logicalID, physicalID}
          let map = tbl=> ({logicalID: tbl.split('-')[1], physicalID: tbl})
          // helper to filter out streams
          let stream = arn=> !arn.includes('stream')
          // clean up the arns w the helpers
          tables = arns.filter(stream).map(table).map(map)
          // return the cleaned up payload
          callback(null, tables)
        }
        catch(e) {
          callback(e)
        }
      }
    })
  }
  else {
    callback(null, tables)
  }
}
