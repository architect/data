var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = require('file-exists')
var init = require('./_init')
  
// check for node_modules/@architect/shared/.arc
var arcPath = path.join(__dirname, '..', 'shared', '.arc')
var notFound = !exists.sync(arcPath)
if (notFound)
  throw ReferenceError('.arc file not found: ' + arcPath)

// returns a client for the .arc 
var arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
