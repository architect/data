var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./_init')

/**
 * reads the cwd .arc
 * and generates a data access layer
 */
module.exports = function data(p) {

  // reads .arc from cwd
  var arcPath = typeof p != 'undefined'? p : path.join(process.cwd(), '.arc')
  var notFound = !exists(arcPath)

  if (notFound) {
    throw ReferenceError('.arc file not found')
  }

  var arc = parse(fs.readFileSync(arcPath).toString())
  return init(arc)
}
