var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var exists = fs.existsSync
var init = require('./src/_init')

// path to the .arc for hydration
var arcPath

let arc4sandbox = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc'),
  arcInCurrentDir = path.join(process.cwd(), '.arc'),
  arcInSharedDir = path.join(__dirname, '..', 'shared', '.arc')

// Arc 4
if (exists(arc4sandbox)) arcPath = arc4sandbox
else if (exists(arcInCurrentDir)) {
  // implicitly if .arc is in the cwd use that (used in arc 3)
  arcPath = arcInCurrentDir
} else if (exists(arcInSharedDir)) {
  // otherwise we are: testing, staging or in production and loading from within node_modules
  // Eg, node_modules/@architect/shared/.arc
  arcPath = arcInSharedDir
} else {
  throw ReferenceError('.arc file not found: ' + arcPath)
}

// returns a client for the .arc
var arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
