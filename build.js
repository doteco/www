const Metalsmith = require('metalsmith')
const autoprefixer = require('metalsmith-autoprefixer')
const csvLoader = require('./helpers/csvLoader')
const discoverHelpers = require('metalsmith-discover-helpers')
const imagemin = require('metalsmith-imagemin')
const inplace = require('metalsmith-in-place')
const fingerprint = require('metalsmith-fingerprint-ignore')
const layouts = require('metalsmith-layouts')
const markdown = require('metalsmith-markdownit')
const sass = require('metalsmith-sass')
const serve = require('metalsmith-serve')
const sitemap = require('metalsmith-sitemap')
const redirect = require('metalsmith-redirect')
const robots = require('metalsmith-robots')
const watch = require('metalsmith-watch')

const env = process.env.NODE_ENV || 'DEV'
console.log('Building for environment:', env)

const ENV_OPTIONS = {
  DEV: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': 'http://localhost:8080',
    watch: true,
    pixel: false,
    profiles: 'https://test.profiles.eco',
    trustmark: 'https://test-trust.profiles.eco',
    intercomAppID: 'gt94nkkh',
    imagemin: false,
    searchUrl: 'https://test-search.go.eco',
    sentryDSN: 'https://75afeef7f5f34bd1b6e3e86120528892@o72378.ingest.sentry.io/5877451'
  },
  TST: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': 'http://test.go.eco',
    watch: false,
    pixel: false,
    profiles: 'https://test.profiles.eco',
    trustmark: 'https://test-trust.profiles.eco',
    intercomAppID: 'gt94nkkh',
    imagemin: true,
    searchUrl: 'https://test-search.go.eco',
    sentryDSN: 'https://75afeef7f5f34bd1b6e3e86120528892@o72378.ingest.sentry.io/5877451'
  },
  PRD: {
    'ga-tracking-id': 'UA-2825422-23',
    'site-url': 'https://go.eco',
    watch: false,
    pixel: true,
    profiles: 'https://profiles.eco',
    trustmark: 'https://trust.profiles.eco',
    intercomAppID: 'hsovcclh',
    imagemin: true,
    searchUrl: 'https://search.go.eco',
    sentryDSN: 'https://b58e840db28c47409688bc4dded2c97a@o72378.ingest.sentry.io/5877454'
  }
}

const options = ENV_OPTIONS[env]
console.log('Using options:', options)

const ms = Metalsmith(__dirname)
  .metadata({
    year: new Date().getFullYear(),
    'img-root': '/img',
    'site-url': options['site-url'],
    'twitter-id': '@doteco',
    'ga-tracking-id': options['ga-tracking-id'],
    livereload: options.watch,
    pixel: options.pixel,
    profiles: options.profiles,
    trustmark: options.trustmark,
    intercomAppID: options.intercomAppID,
    searchUrl: options.searchUrl,
    sentryDSN: options.sentryDSN
  })
  .use(csvLoader())
  .source('./source')
  .destination('./public/')
  .clean(false)
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(sass({
    includePaths: ['./scss'],
    outputDir: 'css',
    outputStyle: 'compressed'
  }))
  .use(autoprefixer())
  .use(fingerprint({
    pattern: 'css/main.css'
  }))
  .use(markdown({
    html: true
  }))
  .use(layouts({
    engine: 'handlebars',
    partials: 'layouts/partials',
    default: 'default.html',
    pattern: '**/*.html'
  }))
  .use(inplace({
    engine: 'handlebars',
    pattern: '**/*.html'
  }))
  .use(sitemap({
    privateProperty: 'exclude',
    hostname: options['site-url'],
    omitIndex: true
  }))
  .use(robots({
    disallow: ['/mobile/*', '/m/*'],
    sitemap: options['site-url'] + '/sitemap.xml'
  }))
  .use(redirect({
    frontmatter: true,
    redirections: {
      '/grants': '/',
      '/policies': '/registrars/policies/',
      '/registrar': '/registrars/',
      '/faq': 'https://support.go.eco',
      '/partners/institute-of-public-environmental-affairs/': 'https://org.eco/'
    }
  }))

if (options.imagemin) {
  ms.use(imagemin({
    cwd: 'source/img',
    mozjpeg: {
      quality: 40
    },
    pngquant: { },
    svgo: { }
  }))
}

ms.build(function (err, files) {
  if (err) { throw err }
})

if (options.watch) {
  ms.use(serve({
    document_root: 'public',
    verbose: true,
    http_error_files: {
      404: '/404.html'
    }
  }))
    .use(watch({
      paths: {
        /* eslint no-template-curly-in-string: 0 */
        '${source}/**/*': true,
        'scss/**/*': '{main.scss,**/*.html}',
        'layouts/**/*': '**/*.html'
      },
      livereload: true
    }))
}
