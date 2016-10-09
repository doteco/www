var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var discoverHelpers = require('metalsmith-discover-helpers')
var sass = require('metalsmith-sass');
var watch = require('metalsmith-watch');
var serve = require('metalsmith-serve');

console.log('Building for environment:', process.env.NODE_ENV || 'DEV');

var options = {
  "ga-tracking-id": process.env.NODE_ENV === "PRD" ? "UA-2825422-14" : "UA-2825422-15",
  watch: ! process.env.NODE_ENV
};

var ms = Metalsmith(__dirname)
  .metadata({
    "site-root": "/new",
    "img-root": "/img",
    "css-root": "/css",
    "ga-tracking-id": options["ga-tracking-id"]
  })
  .source('./source')
  .destination('./public/new/')
  .clean(true)
  .use(sass({
    file: '../scss/main.scss',
    outputDir: '../css',
    "include-path": '../scss'
  }))
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(layouts({
    engine: 'handlebars',
    partials: "layouts/partials",
    default: 'default.html'
  }));

if (options.watch) {
  ms.use(serve({
    "document_root": "public"
  }))
  .use(watch({
    paths: {
      "scss/**/*": true,
      "${source}/**/*": true,
      "layouts/**/*": "**/*"
    }
  }))
}

ms.build(function(err, files) {
    if (err) { throw err; }
});