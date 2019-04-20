var _db = require('./db')
var _doc = require('./doc')
var pfy = require('./_promisify-object')
var env = process.env.NODE_ENV || 'testing'
var testing = env === 'testing' || env === 'staging'

/**
 * accepts an arc object generates a data access layer
 */
module.exports = function _init(arc) {

  // the app namespace
  let app = arc.app[0]

  // helper for getting a table name
  // if we're testing just always use 'staging' tables
  // otherwise falls back to the appname-tablename-env convention
  var _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`

  // list of all tables (if any) defined in .arc
  let tables = arc.tables? arc.tables.slice(0).map(t=> _name(Object.keys(t)[0])) : []

  // create a map of data access methods for each table
  var data = tables.map(TableName=> ({
    delete(key, callback) {
      var params = {}
      params.TableName = TableName
      params.Key = key
      _doc.delete(params, callback)
    },
    get(key, callback) {
      var params = {}
      params.TableName = TableName
      params.Key = key
      _doc.get(params, function _get(err, result) {
        if (err) callback(err)
        else callback(null, result.Item)
      })
    },
    put(item, callback) {
      var params = {}
      params.TableName = TableName
      params.Item = item
      _doc.put(params, function _put(err) {
        if (err) callback(err)
        else callback(null, item)
      })
    },
    query(params, callback) {
      params.TableName = TableName
      _doc.query(params, callback)
    },
    scan(params, callback) {
      params.TableName = TableName
      _doc.scan(params, callback)
    },
    update(params, callback) {
      params.TableName = TableName
      _doc.update(params, callback)
    }
  }))

  // builds out a data layer object
  var layer = {}

  // add _name, _db and _doc helper shortcuts
  Object.defineProperty(layer, '_name', {
    enumerable: false,
    value: _name
  })

  Object.defineProperty(layer, '_db', {
    enumerable: false,
    value: _db
  })

  Object.defineProperty(layer, '_doc', {
    enumerable: false,
    value: _doc
  })

  // add the tables to the returned object
  // this creates the data.tablename namespace
  if (arc.tables) {
    let index = 0
    let names = arc.tables.map(t=> Object.keys(t)[0])
    names.forEach(table=> {
      layer[table] = pfy(data[index])
      index += 1
    })
  }

  return layer
}
