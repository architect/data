#!/usr/bin/env node
var data = require('.')
var repl = require('repl')
var chalk = require('chalk')
var prompt = chalk.green('#!/data> ')
var workflows = require('@architect/workflows')

var db = workflows.sandbox.db.start(function _start() {
  var server = repl.start({prompt})
  server.context.data = data
  server.on('exit', db.close)
})
