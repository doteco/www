var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');

Metalsmith(__dirname)
  .metadata({
  })
  .source('./source')
  .destination('./build')
  .clean(true)
  // .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars',
    default: "default.html"
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });