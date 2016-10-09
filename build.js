var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var discoverHelpers = require('metalsmith-discover-helpers')
var sass = require('metalsmith-sass');
var watch = require('metalsmith-watch');
var serve = require('metalsmith-serve');

Metalsmith(__dirname)
  .metadata({
    "site-root": "/new",
    "img-root": "/img",
    "css-root": "/css"
  })
  .source('./source')
  .destination('./public/new/')
  .clean(false)
  .use(sass({
    file: '../scss/index.scss',
    outputDir: '../css',
    "include-path": '../scss'
  }))
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(layouts({
    engine: 'handlebars',
    default: 'default.html'
  }))
  .use(serve({
    "document_root": "public"
  }))
  .use(watch({
    paths: {
      "scss/**/*": true,
      "${source}/**/*": true,
      "layouts/**/*": "**/*"
    }
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });