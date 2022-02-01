const Metalsmith = require('metalsmith')
const autoprefixer = require('metalsmith-autoprefixer')
const discoverHelpers = require('metalsmith-discover-helpers')
const discoverPartials = require('metalsmith-discover-partials')
const inplace = require('metalsmith-in-place')
const fingerprint = require('metalsmith-fingerprint-ignore')
const layouts = require('metalsmith-layouts')
const sass = require('metalsmith-sass')
const serve = require('metalsmith-serve')
const sitemap = require('metalsmith-sitemap')
const redirect = require('metalsmith-redirect')
const robots = require('metalsmith-robots')
const watch = require('metalsmith-watch')
const i18next = require('metalsmith-i18next')

const defaultLang = 'en'
const env = process.env.NODE_ENV || 'DEV'
const lang = (process.env.SITE_LANG || defaultLang).toLocaleLowerCase()
const dest = lang === 'en' ? 'public' : 'public-' + lang
const filterDefaults = ({
  en: {},
  fr: { language: 'Français' },
  de: { language: 'Deutsch' }
})[lang]

console.log('Building for environment:', env, lang)

const ENV_OPTIONS = {
  DEV: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': {
      en: 'http://localhost:8080',
      fr: 'https://fr.test.go.eco',
      de: 'https://de.test.go.eco'
    },
    watch: true,
    profiles: 'https://test.profiles.eco',
    trustmark: 'https://test-trust.profiles.eco',
    intercomAppID: 'gt94nkkh',
    searchUrl: 'https://test-search.go.eco',
    sentryDSN: 'https://75afeef7f5f34bd1b6e3e86120528892@o72378.ingest.sentry.io/5877451',
    noindex: true,
    makeOfferForm: 'https://docs.google.com/forms/d/e/1FAIpQLScdAh6F_o-CXehz2bSfJKLToxUUM9U4vK0NE5GdDS6NCiSvAQ/formResponse'
  },
  TST: {
    'ga-tracking-id': 'UA-2825422-15',
    'site-url': {
      en: 'https://test.go.eco',
      fr: 'https://fr.test.go.eco',
      de: 'https://de.test.go.eco'
    },
    watch: false,
    profiles: 'https://test.profiles.eco',
    trustmark: 'https://test-trust.profiles.eco',
    intercomAppID: 'gt94nkkh',
    searchUrl: 'https://test-search.go.eco',
    sentryDSN: 'https://75afeef7f5f34bd1b6e3e86120528892@o72378.ingest.sentry.io/5877451',
    noindex: true,
    makeOfferForm: 'https://docs.google.com/forms/d/e/1FAIpQLScdAh6F_o-CXehz2bSfJKLToxUUM9U4vK0NE5GdDS6NCiSvAQ/formResponse'
  },
  PRD: {
    'ga-tracking-id': { en: 'UA-2825422-23', de: 'UA-2825422-16' },
    'site-url': {
      en: 'https://go.eco',
      de: 'https://kauf.eco'
    },
    watch: false,
    profiles: 'https://profiles.eco',
    trustmark: 'https://trust.profiles.eco',
    intercomAppID: 'hsovcclh',
    searchUrl: 'https://search.go.eco',
    sentryDSN: 'https://b58e840db28c47409688bc4dded2c97a@o72378.ingest.sentry.io/5877454',
    makeOfferForm: 'https://docs.google.com/forms/d/e/1FAIpQLScjnQNdyxwhKLM0s7l8h3AKp66WcTY72Qrw5JMC3s9m_k7uVA/formResponse'
  }
}

const options = ENV_OPTIONS[env]
console.log('Using options:', options)
const siteUrl = options['site-url'][lang] || options['site-url'].en

const sitemapLinks = () => {
  return (files, metalsmith, done) => {
    for (const [path, file] of Object.entries(files)) {
      if (path.endsWith('.html')) {
        if (lang !== defaultLang && !file.i18nNamespace) {
          file.exclude = true
        }
        file.sitemapLinks = Object.entries(options['site-url']).map(e => ({ lang: e[0], url: e[1] + '/' + path.replace('index.html', '') }))
      }
    }
    done()
  }
}

const ms = Metalsmith(__dirname)
  .metadata({
    year: new Date().getFullYear(),
    'img-root': '/img',
    'site-url': siteUrl,
    'twitter-id': '@doteco',
    'ga-tracking-id': options['ga-tracking-id'][lang] || options['ga-tracking-id'],
    livereload: options.watch,
    profiles: options.profiles,
    trustmark: options.trustmark,
    intercomAppID: options.intercomAppID,
    searchUrl: options.searchUrl,
    sentryDSN: options.sentryDSN,
    noindex: options.noindex,
    makeOfferForm: options.makeOfferForm,
    lang,
    sites: options['site-url'],
    filterDefaults
  })
  .source('./source')
  .destination(dest)
  .clean(false)
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(discoverPartials({
    directory: 'layouts/partials'
  }))
  .use(sass({
    includePaths: ['./scss'],
    outputDir: 'css',
    outputStyle: 'compressed',
    sourceMap: true,
    sourceMapContents: true
  }))
  .use(autoprefixer())
  .use(fingerprint({
    pattern: '{css/main.css,js/domain-search.js}'
  }))
  .use(i18next({
    locales: [lang],
    namespaces: ['global'],
    pattern: '**/*.hbs',
    engine: 'handlebars',
    helpers: null,
    path: ':file',
    frontMatterKeys: ['title', 'description']
  }))
  .use(layouts({
    pattern: '**/*.hbs',
    default: 'default.hbs'
  }))
  .use(inplace({
    pattern: '**/*.hbs'
  }))
  .use(sitemapLinks())
  .use(sitemap({
    privateProperty: 'exclude',
    hostname: siteUrl,
    links: 'sitemapLinks',
    omitIndex: true
  }))
  .use(robots({
    disallow: ['/search/'],
    sitemap: siteUrl + '/sitemap.xml'
  }))
  .use(redirect({
    frontmatter: true,
    redirections: {
      '/grants': '/',
      '/registrars/policies/': '/policies/',
      '/registrars/funding/': '/registrars/',
      '/registrars/partners/': '/registrars/',
      '/registrar': '/registrars/',
      '/faq': 'https://support.go.eco',
      '/names/premiums/': '/search/',
      '/partners/institute-of-public-environmental-affairs/': 'https://org.eco/'
    }
  }))

ms.build(function (err, files) {
  if (err) { throw err }
})

if (options.watch) {
  ms.use(serve({
    document_root: dest,
    verbose: true,
    http_error_files: {
      404: '/404.html'
    }
  }))
    .use(watch({
      paths: {
        /* eslint no-template-curly-in-string: 0 */
        '${source}/**/*': '{**/*.hbs,**/*.js}',
        'scss/**/*': '{main.scss,**/*.hbs}',
        'layouts/**/*': '**/*.hbs',
        'locales/**/*': '**/*.hbs'
      },
      livereload: true
    }))
}
