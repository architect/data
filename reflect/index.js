let parallel = require('run-parallel')
let readIAM = require('./read-iam')
let readArc = require('./read-arc')
let factory = require('./factory')
let sandbox = require('./sandbox')

/**
 * reflection
 *
 * :new: iam based async service discovery code path
 *
 */
module.exports = function reflect(callback) {
  let promise
  if (!callback) {
    promise = new Promise(function ugh(res, rej) {
      callback = function errback(err, result) {
        if (err) rej(err)
        else res(result)
      }
    })
  }
  if (process.env.NODE_ENV === 'testing') {
    readArc(function errback(err, arc) {
      if (err) callback(err)
      else callback(null, sandbox(arc))
    })
  }
  else {
    parallel({
      tables(callback) {
        readIAM(callback)
      },
      arc(callback) {
        readArc(callback)
      }
    },
    function done(err, {arc, tables}) {
      if (err) callback(err)
      else {
        callback(null, factory({arc, tables}))
      }
    })
  }
  return promise
}
