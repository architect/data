let toLogicalID = require('./_to-logical-id')
let env = process.env.NODE_ENV || 'testing'

// helper for getting a table name
// if we're testing just always use 'staging' tables
// otherwise falls back to the appname-tablename-env convention
// var _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`
module.exports = function getTables(arc) {
  if (!arc.tables || arc.tables && arc.tables.length === 0)
    return []
  if (process.env.ARC_CLOUDFORMATION) {
    // lookup cloudformation generated table name
    return arc.tables.map(function getCloudFormationName(table) {
      // arc table name
      let tableName = Object.keys(table)[0]
      let envVarName = `ARC_TABLE_${toLogicalID(tableName).toUpperCase()}`
      return process.env[envVarName]
    })
  }
  else {
    // traditional path
    let testing = env === 'testing' || env === 'staging'
    let app = arc.app[0]

    // helper for getting a table name
    // if we're testing just always use 'staging' tables
    // otherwise falls back to the appname-tablename-env convention
    let _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`

    // list of all tables (if any) defined in .arc
    return arc.tables.map(t=> _name(Object.keys(t)[0]))
  }
}

