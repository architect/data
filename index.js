var fs = require('fs')
var path = require('path')
var aws = require('aws-sdk')
var _db = require('./db')
var _doc = require('./doc')
var parse = require('@architect/parser')
var exists = require('file-exists')
var pfy = require('./_promisify-object')
var init = require('./_init')

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
  return init(arc)
}
