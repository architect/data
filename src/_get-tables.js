let env = process.env.NODE_ENV || 'testing'

module.exports = function getTables(arc) {
  if (!arc.tables || arc.tables && arc.tables.length === 0)
    return []

  let testing = env === 'testing' || env === 'staging'
  let app = arc.app[0]

  // helper for getting a table name
  // if we're testing just always use 'staging' tables
  // otherwise falls back to the appname-tablename-env convention
  let _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`

  // list of all tables (if any) defined in .arc
  return arc.tables.map(t=> _name(Object.keys(t)[0]))
}
