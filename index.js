var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./_init')

// path to the .arc for hydration
var arcPath

// see if we are testing @architect/data itself
var diagnostics = process.env.hasOwnProperty('ARC_LOCAL')
if (diagnostics) {
  // explicitly chosing to use it
  arcPath = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
}
else if (exists(path.join(process.cwd(), '.arc'))) {
  // implicitly if .arc is in the cwd use that
  arcPath = path.join(process.cwd(), '.arc')
}
else if (exists(path.join(__dirname, '..', 'shared', '.arc'))) {
  // otherwise we are: testing, staging or in production and loading from within node_modules
  // check for node_modules/@architect/shared/.arc
  arcPath = path.join(__dirname, '..', 'shared', '.arc')
}
else {
  throw ReferenceError('.arc file not found: ' + arcPath)
}

// returns a client for the .arc
var arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
