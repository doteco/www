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

let env = process.env.NODE_ENV || 'DEV'
console.log('Building for environment:', env)

const ENV_OPTIONS = {
  DEV: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': 'http://localhost:8080',
    'watch': true,
    'pixel': false,
    'profiles': 'https://test.profiles.eco',
    'trustmark': 'https://test-trust.profiles.eco',
    'intercomAppID': 'gt94nkkh',
    'imagemin': false
  },
  TST: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': 'http://test.home.eco',
    'watch': false,
    'pixel': false,
    'profiles': 'https://test.profiles.eco',
    'trustmark': 'https://test-trust.profiles.eco',
    'intercomAppID': 'gt94nkkh',
    'imagemin': true
  },
  PRD: {
    'ga-tracking-id': 'UA-2825422-14',
    'site-url': 'https://home.eco',
    'watch': false,
    'pixel': true,
    'profiles': 'https://profiles.eco',
    'trustmark': 'https://trust.profiles.eco',
    'intercomAppID': 'hsovcclh',
    'imagemin': true
  }
}

let options = ENV_OPTIONS[env]
console.log('Using options:', options)

let ms = Metalsmith(__dirname)
  .metadata({
    'year': new Date().getFullYear(),
    'img-root': '/img',
    'site-url': options['site-url'],
    'twitter-id': '@doteco',
    'ga-tracking-id': options['ga-tracking-id'],
    'livereload': options.watch,
    'pixel': options.pixel,
    'profiles': options.profiles,
    'trustmark': options.trustmark,
    'intercomAppID': options.intercomAppID
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
  .use(redirect({
    '/grants': '/community/grants',
    '/policies': '/registrars/policies',
    '/registrar': '/registrars',
    // '/': 'https://go.eco/',
    '/about/story': 'https://go.eco/our_story/',
    '/about/team': 'https://go.eco/our_story/',
    '/about/press': 'https://go.eco/contact-us-2-2/',
    '/names/premiums': 'https://go.eco/quality/',
    '/contact': 'https://go.eco/contact-us-2/',
    '/registrars': 'https://go.eco/eco_registrars/',
    '/registrars/resources': 'https://go.eco/eco_registrars/',
    '/registrars/funding': 'https://go.eco/eco_registrars/',
    '/registrars/partners': 'https://go.eco/eco_registrars_list/',
    '/privacy': 'https://go.eco/privacy_policy/',
    '/studies/goodonyou': 'https://go.eco/contact-us-2-2/',
    '/studies/koala': 'https://go.eco/contact-us-2-2/',
    '/studies/voltstack': 'https://go.eco/contact-us-2-2/',
    '/studies/salishsea': 'https://go.eco/contact-us-2-2/',
    '/studies/studyabroad': 'https://go.eco/contact-us-2-2/',
    '/faq': 'https://support.home.eco',
    '/impact': 'https://go.eco/environmental_policy-2/'
  }))
  .use(sitemap({
    hostname: options['site-url'],
    omitIndex: true
  }))
  .use(robots({
    disallow: ['champions/*', 'mobile/*', 'm/*', 'names/premiums?name=*'],
    sitemap: options['site-url'] + '/sitemap.xml'
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
