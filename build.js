var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');

Metalsmith(__dirname)
  .metadata({
  })
  .source('./source')
  .destination('./nic/new/')
  .clean(false)
  .use(layouts({
    engine: 'handlebars',
    default: 'default.html'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });