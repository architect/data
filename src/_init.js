let _db = require('../db')
let _doc = require('../doc')
let tables = require('./_get-tables')
let pfy = require('./_promisify-object')
let env = process.env.NODE_ENV || 'testing'
let testing = env === 'testing' || env === 'staging'

/**
 * accepts an arc object generates a data access layer
 */
module.exports = function _init(arc) {
  let app = arc.app[0]

  // helper for getting a table name
  // if we're testing just always use 'staging' tables
  // otherwise falls back to the appname-tablename-env convention
  let _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`

  // create a map of data access methods for each table
  let data = tables(arc).map(TableName=> ({
    delete(key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      _doc.delete(params, callback)
    },
    get(key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      _doc.get(params, function _get(err, result) {
        if (err) callback(err)
        else callback(null, result.Item)
      })
    },
    put(item, callback) {
      let params = {}
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
  let layer = {}

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
