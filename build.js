var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var inplace     = require('metalsmith-in-place');
var discoverHelpers = require('metalsmith-discover-helpers');
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
    "img-root": "/img",
    "css-root": "/css",
    "ga-tracking-id": options["ga-tracking-id"],
    "livereload": options.watch
  })
  .source('./source')
  .destination('./public/')
  .clean(false)
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(sass({
    includePaths: ['./scss'],
    outputDir: 'css',
  }))
  .use(layouts({
    engine: 'handlebars',
    partials: "layouts/partials",
    default: 'default.html',
    pattern: "**/*.html"
  }))
  .use(inplace({
    engine: 'handlebars',
    pattern: "**/*.html"
  }));

if (options.watch) {
  ms.use(serve({
    "document_root": "public",
    verbose: true
  }))
  .use(watch({
    paths: {
      "${source}/**/*": true,
      "scss/**/*": "main.scss",
      "layouts/**/*": "**/*.html"
    },
    livereload: true
  }))
}

ms.build(function(err, files) {
    if (err) { throw err; }
});