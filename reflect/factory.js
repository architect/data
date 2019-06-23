let _db = require('../db')
let _doc = require('../doc')
let promisify = require('../src/_promisify-object')

/**
 * returns a data client
 */
module.exports = function reflectFactory({arc, tables}) {

  let client = factory(tables)
  let reduce = (a, b)=> Object.assign({}, a, b)
  let data = arc.tables.map(client).reduce(reduce, {})

  Object.defineProperty(data, '_db', {
    enumerable: false,
    value: _db
  })

  Object.defineProperty(data, '_doc', {
    enumerable: false,
    value: _doc
  })

  return data
}

function toLogicalID(str) {
  str = str.replace(/([A-Z])/g, ' $1')
  if (str.length === 1)
    return str.toUpperCase()
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase()
  str = str.charAt(0).toUpperCase() + str.slice(1)
  str = str.replace(/[\W_]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase()
  })
  if (str === 'Get') return 'GetIndex'
  else return str
}

function factory(tables) {
  return function clientFactory(table) {
    let tablename = Object.keys(table)[0]
    let find = ({logicalID})=> logicalID === `${toLogicalID(tablename)}Table`
    let TableName = tables.find(find).physicalID
    if (!TableName)
      throw ReferenceError(`${tablename} table not found!`)
    let client = {
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
    }
    let result = {}
    result[tablename] = promisify(client)
    return result
  }
}
