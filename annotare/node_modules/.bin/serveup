#!/usr/bin/env node
var strata   = require('strata');
var argv     = require('optimist').argv;
var resolve  = require('path').resolve;

var path = resolve(argv._[0] || process.cwd());
var port = argv.p || argv.port || process.env.PORT || 9294;

app = new strata.Builder;
app.use(strata.contentLength);
app.use(strata.static, path);

strata.run(app, {port: port});