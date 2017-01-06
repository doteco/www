const Metalsmith  = require('metalsmith');
const discoverHelpers = require('metalsmith-discover-helpers');
const imagemin = require('metalsmith-imagemin/lib/node6');
const inplace     = require('metalsmith-in-place');
const fingerprint = require('metalsmith-fingerprint-ignore');
const layouts     = require('metalsmith-layouts');
const markdown = require('metalsmith-markdownit');
const sass = require('metalsmith-sass');
const serve = require('metalsmith-serve');
const sitemap = require('metalsmith-sitemap');
const redirect = require('metalsmith-redirect');
const robots = require('metalsmith-robots');
const watch = require('metalsmith-watch');

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
  .use(fingerprint({
    pattern: 'css/main.css'
  }))
  .use(markdown({
    html: true
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
  }))
  .use(redirect({
    '/registrar': '/registrars'
  }))
  .use(sitemap({
    hostname: options["site-url"],
    omitIndex: true
  }))
  .use(robots({
    disallow: ['champions/*', 'mobile/*', 'm/*'],
    sitemap: options["site-url"] + "sitemap.xml"
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
      "scss/**/*": "{main.scss,**/*.html}",
      "layouts/**/*": "**/*.html"
    },
    livereload: true
  }))
}

ms.build(function(err, files) {
    if (err) { throw err; }
});