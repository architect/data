var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./src/_init')

// path to the .arc for hydration
var arcPath

var local = process.env.hasOwnProperty('ARC_LOCAL')
// see if we are using @architect/data locally in sandbox
if (local) {
  // Arc 4 Sandbox
  let arc4 = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
  // Arc 3 sandbox
  let arc3 = path.join(process.cwd(), '.arc')
  if (exists(arc4)) arcPath = arc4
  else if (exists(arc3)) arcPath = arc3
  else throw ReferenceError('.arc file not found: ' + arcPath)
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
