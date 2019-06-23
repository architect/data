let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')
let exists = fs.existsSync
let init = require('./src/_init')

/**
 * NOTE: this code path will incur a bunch of sync lookups
 */
let arcPath
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
let arc = parse(fs.readFileSync(arcPath).toString())

module.exports = init(arc)
