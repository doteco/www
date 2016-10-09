var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var discoverHelpers = require('metalsmith-discover-helpers')
var watch = require('metalsmith-watch');
var serve = require('metalsmith-serve');

Metalsmith(__dirname)
  .metadata({
    "site-root": "/new",
    "img-root": "/img",
    "css-root": "/css"
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
  .use(serve({
    "document_root": "nic"
  }))
  .use(watch({
    paths: {
      "${source}/**/*": true,
      "layouts/**/*": "**/*"
    }
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });