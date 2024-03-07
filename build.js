const browserSync = require('browser-sync')
const Metalsmith = require('metalsmith')
const autoprefixer = require('metalsmith-autoprefixer')
const discoverHelpers = require('metalsmith-discover-helpers')
const discoverPartials = require('metalsmith-discover-partials')
const inplace = require('@metalsmith/in-place')
const fingerprint = require('metalsmith-fingerprint-ignore')
const layouts = require('@metalsmith/layouts')
const sass = require('@metalsmith/sass')
const sitemap = require('metalsmith-sitemap')
const redirect = require('metalsmith-redirect')
const robots = require('metalsmith-robots')
const watch = require('metalsmith-watch')
const i18next = require('metalsmith-i18next')
const collections = require('@metalsmith/collections')
const rss = require('@metalsmith/rss')

const defaultLang = 'en'
const env = process.env.NODE_ENV || 'DEV'
const lang = (process.env.SITE_LANG || defaultLang).toLocaleLowerCase()
const dest = lang === 'en' ? 'public' : 'public-' + lang
const languages = {
  en: 'English',
  fr: 'français',
  de: 'Deutsch'
}
const filterDefaults = ({
  en: {},
  fr: { language: languages.fr },
  de: { language: languages.de }
})[lang]
const allProfiles = require(`./locales/${lang}/featured-profiles.json`)
const priorityProfiles = allProfiles.filter(p => p.priority > 0).sort((a, b) => a.priority - b.priority)
const featuredProfiles = [...allProfiles].sort((a, b) => a.domain.localeCompare(b.domain))

console.log('Building for environment:', env, lang)

const ENV_OPTIONS = {
  DEV: {
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
    sentryUri: 'https://js.sentry-cdn.com/75afeef7f5f34bd1b6e3e86120528892.min.js',
    noindex: true,
    makeOfferForm: 'https://docs.google.com/forms/d/e/1FAIpQLScdAh6F_o-CXehz2bSfJKLToxUUM9U4vK0NE5GdDS6NCiSvAQ/formResponse'
  },
  TST: {
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
    sentryUri: 'https://js.sentry-cdn.com/75afeef7f5f34bd1b6e3e86120528892.min.js',
    noindex: true,
    makeOfferForm: 'https://docs.google.com/forms/d/e/1FAIpQLScdAh6F_o-CXehz2bSfJKLToxUUM9U4vK0NE5GdDS6NCiSvAQ/formResponse'
  },
  PRD: {
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
    sentryUri: 'https://js.sentry-cdn.com/b58e840db28c47409688bc4dded2c97a.min.js',
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
          file.redirectTo = '/'
        } else if (file.i18nNamespace) {
          file.sitemapLinks = Object.entries(options['site-url']).map(e => ({ lang: e[0], url: e[1] + '/' + path.replace('index.html', '') }))
        }
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
    livereload: options.watch,
    profiles: options.profiles,
    trustmark: options.trustmark,
    intercomAppID: options.intercomAppID,
    searchUrl: options.searchUrl,
    sentryUri: options.sentryUri,
    noindex: options.noindex,
    makeOfferForm: options.makeOfferForm,
    lang,
    languages,
    sites: options['site-url'],
    filterDefaults,
    featuredProfiles,
    priorityProfiles
  })
  .source('./source')
  .destination(dest)
  .clean(false)
  .use(discoverHelpers({
    directory: './helpers'
  }))
  .use(sass({
    entries: {
      './scss/main.scss': 'css/main.css'
    },
    style: 'compressed',
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
  .use(discoverPartials({
    directory: 'layouts/partials'
  }))
  .use(collections({
    news: {
      sortBy: 'pubdate',
      reverse: true,
      refer: false
    },
    studies: {
      sortBy: 'title',
      refer: false
    }
  }))
  .use(inplace({
    pattern: [
      '**/*.hbs', '**/*.md.hbs'
    ]
  }))
  .use(layouts({
    pattern: '**/*.html',
    default: 'default.hbs'
  }))
  .use(sitemapLinks())
  .use(sitemap({
    privateProperty: 'exclude',
    hostname: siteUrl,
    links: 'sitemapLinks',
    omitIndex: true
  }))
  .use(robots({
    sitemap: siteUrl + '/sitemap.xml'
  }))
  .use(redirect({
    frontmatter: true,
    noindex: false,
    redirections: {
      '/registrars/policies/': '/policies/',
      '/registrars/funding/': '/registrars/',
      '/registrars/partners/': '/registrars/',
      '/registrar': '/registrars/',
      '/frequently-asked-questions': '/faq/',
      '/shop': '/',
      '/affiliate': '/',
      '/bthechange2017': '/',
      '/names/premiums/': '/search/',
      '/partners/institute-of-public-environmental-affairs/': 'https://org.eco/',
      '/news/the-world-needs-more-tigers-13eb6e5eb394': '/news/',
      '/news/first-ever-domain-grants-program-wraps-up-583234092c10': '/news/',
      '/news/understanding-your-aim-1d02eebce1e8': '/news/',
      '/rss/': '/rss.xml',
      '/feed/': '/rss.xml',
      '/news/feed': '/rss.xml',
      '/the-eco-story/': '/about/story/'
    }
  }))
  .use(rss({
    feedOptions: {
      title: '.eco news',
      site_url: siteUrl
    },
    collection: 'news',
    pathProperty: 'page-path'
  })
  )

ms.build(function (err, files) {
  if (err) { throw err }
})

if (options.watch) {
  ms.use(watch({
    paths: {
      /* eslint no-template-curly-in-string: 0 */
      '${source}/**/*': '{**/*.hbs,**/*.js,**/*.md,**/*.svg}',
      'scss/**/*': '{main.scss,**/*.hbs,**/*.md}',
      'layouts/**/*': '**/*.hbs',
      'locales/**/*': '**/*.hbs'
    },
    livereload: true
  }))

  browserSync.init({
    port: 8080,
    server: dest,
    watch: true,
    open: false
  })
} else {
  ms.use(function (files) {
    const out = Object.values(files).filter(file => file.title).map(f => [f.path, f.title, f.description, f.excerpt || ''])
    out.forEach(o => console.log(o.join(',')))
  })
}
