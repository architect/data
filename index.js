var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./src/_init')

// path to the .arc for hydration
var arcPath

let arcDefault = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let arcInCurrentDir = path.join(process.cwd(), '.arc')
let arcInSharedDir = path.join(__dirname, '..', 'shared', '.arc')

if (exists(arcDefault)) {
  // Arc default path (used in Arc 4 as well as ARC_LOCAL)
  arcPath = arcDefault
}
else if (exists(arcInCurrentDir)) {
  // If .arc is in the cwd, use that (used in Arc 3)
  arcPath = arcInCurrentDir
}
else if (exists(arcInSharedDir)) {
  // Otherwise we are: testing, staging, or in production and loading from within node_modules
  // Eg, ./node_modules/@architect/shared/.arc
  arcPath = arcInSharedDir
}
else {
  throw ReferenceError('.arc file not found: ' + arcPath)
}

// returns a client for the .arc
var arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
