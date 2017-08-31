var fs = require('fs')
var path = require('path')
var aws = require('aws-sdk')
var _db = require('./db')
var _doc = require('./doc')
var parse = require('@architect/parser')

/**
 * reads the cwd .arc
 * and generates a data access layer
 */
module.exports = function data() {
  
  // reads .arc from cwd
  var arc = parse(fs.readFileSync(path.join(process.cwd(), '.arc')).toString())
  var app = arc.app[0]

  // helper for getting a table name
  // if we're testing just always use 'staging' tables
  // otherwise falls back to the appname-tablename-env convention
  var testing = typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV === 'testing'
  var _name = name=> `${app}-${testing? 'staging' : process.env.NODE_ENV}-${name}`

  // gets all the tables for the current env
  var tables = arc.tables.slice(0).map(t=> _name(Object.keys(t)[0]))

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
      _doc.put(params, function _put(err, result) {
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
      _doc.update(params, function _update(err, result) {
        if (err) callback(err)
        else callback() 
      })     
    }
  }))
 
  // builds out a data layer object
  var index = 0
  var layer = {
    _name,
    _db,
    _doc,
  }
  arc.tables.map(t=> Object.keys(t)[0]).forEach(table=> {
    layer[table] = data[index]
    index += 1
  })
  return layer
}
