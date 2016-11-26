const Metalsmith  = require('metalsmith');
const layouts     = require('metalsmith-layouts');
const inplace     = require('metalsmith-in-place');
const discoverHelpers = require('metalsmith-discover-helpers');
const sass = require('metalsmith-sass');
const watch = require('metalsmith-watch');
const serve = require('metalsmith-serve');
const imagemin = require('metalsmith-imagemin/lib/node6');

console.log('Building for environment:', process.env.NODE_ENV || 'DEV');

let options = {
  "ga-tracking-id": process.env.NODE_ENV === "PRD" ? "UA-2825422-14" : "UA-2825422-15",
  watch: ! process.env.NODE_ENV
};

let ms = Metalsmith(__dirname)
  .metadata({
    "img-root": "/img",
    "css-root": "/css",
    "site-url": "https://nic.eco",
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
  }))
  .use(imagemin({
    mozjpeg: { },
    pngquant: { },
    svgo: { }
  }));

if (options.watch) {
  ms.use(serve({
    "document_root": "public",
    verbose: true,
    http_error_files: {
      404: "/404.html"
    }
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