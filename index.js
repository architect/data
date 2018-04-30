var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./_init')
  
// path to the .arc for hydration
var arcPath 

// see if we are testing @architect/data itself
var diagnostics = process.env.NODE_ENV === 'testing' && process.env.ARC_CONTRIB === 'yas'
if (diagnostics) {
  // we are running self diagnostics
  arcPath = path.join(process.cwd(), '.arc')
}
else {
  // otherwise we are: testing, staging or in production and loading from within node_modules
  // check for node_modules/@architect/shared/.arc
  arcPath = path.join(__dirname, '..', 'shared', '.arc')
}
  
// if this module is required and cannot find .arc it will blow up
var notFound = !exists(arcPath)
if (notFound)
  throw ReferenceError('.arc file not found: ' + arcPath)

// returns a client for the .arc 
var arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
