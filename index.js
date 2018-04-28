var fs = require('fs')
var path = require('path')
var aws = require('aws-sdk')
var _db = require('./db')
var _doc = require('./doc')
var parse = require('@architect/parser')
var exists = require('file-exists')

// accepts an errback and returns a promisified fn
function promised(fn) {
  return function _promisified(params, callback) {
    if (!callback) {
      return new Promise(function(res, rej) {
        fn(params, function(err, result) {
          err ? rej(err) : res(result)
        })
      })
    }
    else {
      fn(params, callback)
    }
  }
}

// accepts an object and promisifies all keys
function pfy(obj) {
  var copy = {}
  Object.keys(obj).forEach(k=> {
    copy[k] = promised(obj[k])
  })
  return copy
}

/**
 * reads the cwd .arc
 * and generates a data access layer
 */
module.exports = function data(p) {
  
  // reads .arc from cwd
  var arcPath = typeof p != 'undefined'? p : path.join(process.cwd(), '.arc')
  var notFound = !exists.sync(arcPath)

  if (notFound) {
    throw ReferenceError('.arc file not found')
  }

  var arc = parse(fs.readFileSync(arcPath).toString())
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
    /**
     * TODO need to document how everything prepopulates the TableName param
     * TODO need to document how delete, get and put accept params directly [keys(s) and item respectively]
     */
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
  var index = 0
  var names = arc.tables.map(t=> Object.keys(t)[0])
  names.forEach(table=> {
    layer[table] = pfy(data[index])
    index += 1
  })

  return layer
}
