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
const featuredProfiles = [
  {
    domain: 'leap.eco',
    img: 'https://cdn.profiles.eco/images/leap.eco/5eddd04e-44ba-4834-a737-7fa72880c7a7_1500x500.jpeg',
    type: 'Business',
    location: 'UK',
    story: '<a href="https://leap.eco">Leap</a> is a design studio that believes in designing with purpose and creating work that matters. As a BCorp, they create responsible and high-impact design solutions that exceed triple bottom line standards.'
  },
  {
    domain: 'preserve.eco',
    img: 'https://cdn.profiles.eco/images/preserve.eco/e809d85e-2f52-4e03-921c-aed2da6c7cfa_1500x500.jpeg',
    type: 'Business',
    location: 'US',
    story: '<a href="https://preserve.eco">Preserve</a>, a certified B Corporation, makes stylish, eco-friendly products for the home including a full line of reusable tableware, food storage, and personal care products, using 100% recycled plastic.'
  },
  {
    domain: 'supplychainresearch.eco',
    img: 'https://cdn.profiles.eco/images/supplychainresearch.eco/957cafa7-8153-495e-858f-332f5b7d8aad_1500x500.jpeg',
    type: 'Non-profit',
    location: 'US',
    story: 'Meridian Institute established the <a href="https://www.supplychainresearch.eco/">Supply Chain Sustainability Research Fund</a> to increase understanding of sustainability in agriculture, seafood, and forest supply chains.'
  },
  {
    domain: 'bleu.eco',
    img: 'https://cdn.profiles.eco/images/bleu.eco/cd4a2de1-a12b-4c6a-99c9-2a5b91e66926_1500x500.jpeg',
    type: 'Business',
    location: 'Canada',
    story: 'Bleu.eco designs ecological matresses and beds using natural materials at reasonable prices. 3 trees are planted for each mattress sold.'
  },
  {
    domain: 'beep.eco',
    img: 'https://cdn.profiles.eco/images/beep.eco/7eabe794-fe2a-41b4-9972-1000d1e07a96_1500x500.jpg',
    type: 'Business',
    location: 'Canada',
    story: 'Climate Smart Businesses Inc. enables businesses to profitably reduce greenhouse gas emissions.'
  },
  {
    domain: 'grunbag.eco',
    img: 'https://cdn.profiles.eco/images/grunbag.eco/2436f994-4fbc-4d0e-9ce0-167f630bbb01_1500x500.jpeg',
    type: 'Business',
    location: 'Germany',
    story: 'GRÜNBAG makes high-quality bags that last, using only durable materials to reduce future waste.'
  }
]

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
    'ga-tracking-id': { en: 'UA-2825422-23', de: 'UA-2825422-16', fr: 'G-PJ7G8X9GSD' },
    'site-url': {
      en: 'https://go.eco',
      de: 'https://kauf.eco',
      fr: 'https://allez.eco'
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
    filterDefaults,
    featuredProfiles
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
