var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var discoverHelpers = require('metalsmith-discover-helpers')

Metalsmith(__dirname)
  .metadata({
  })
  .source('./source')
  .destination('./nic/new/')
  .clean(false)
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(layouts({
    engine: 'handlebars',
    default: 'default.html'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });