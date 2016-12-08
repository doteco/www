const Metalsmith  = require('metalsmith');
const layouts     = require('metalsmith-layouts');
const inplace     = require('metalsmith-in-place');
const discoverHelpers = require('metalsmith-discover-helpers');
const sass = require('metalsmith-sass');
const watch = require('metalsmith-watch');
const serve = require('metalsmith-serve');
const imagemin = require('metalsmith-imagemin/lib/node6');

let env = process.env.NODE_ENV || 'DEV';
console.log('Building for environment:', env);

const env_options = {
  DEV: {
    "ga-tracking-id": "UA-2825422-15",
    "site-url": "http://localhost:8080",
    "watch": true
  },
  TST: {
    "ga-tracking-id": "UA-2825422-15",
    "site-url": "http://test.home.eco",
    "watch": false
  },
  PRD: {
    "ga-tracking-id": "UA-2825422-14",
    "site-url": "https://home.eco",
    "watch": false
  }
}

let options = env_options[env];
console.log('Using options:', options);

let ms = Metalsmith(__dirname)
  .metadata({
    "img-root": "/img",
    "css-root": "/css",
    "site-url": options["site-url"],
    "twitter-id": "@doteco",
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