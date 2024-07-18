const Handlebars = require('handlebars')
const { format: dateFormat } = require('date-fns')
const { deLocale } = require('date-fns/locale/de')
const { frLocale } = require('date-fns/locale/fr')

function lookupLocale (l) {
  if (l === 'de') return deLocale
  if (l === 'fr') return frLocale
  return null
}

Handlebars.registerHelper('equal', function (lvalue, rvalue) {
  return lvalue === rvalue
})

Handlebars.registerHelper('notequal', function (lvalue, rvalue) {
  return lvalue !== rvalue
})

Handlebars.registerHelper('notempty', function (value) {
  return value?.length > 0
})

Handlebars.registerHelper('checkActive', function (current, active) {
  return current === active ? 'active' : ''
})

Handlebars.registerHelper('json', function (object) {
  return new Handlebars.SafeString(JSON.stringify(object))
})

Handlebars.registerHelper('concat', (a, b) => a + b)

Handlebars.registerHelper('isoDate', date => date && date.toISOString())

Handlebars.registerHelper('formatDay', (date, locale) => date && dateFormat(date, 'PPP', { locale: lookupLocale(locale) }))

Handlebars.registerHelper('formatUTC', date => date && dateFormat(date, 'yyyy-MM-dd'))

function pagePath (path) {
  return path?.replace(/index\..*$/, '')
}

Handlebars.registerHelper('pagePath', pagePath)

Handlebars.registerHelper('newsColumns', index => (index % 4 === 0 || index % 4 === 3) ? 5 : 7)

Handlebars.registerHelper('lookupArticle', function (collection, path) {
  return collection.find(article => pagePath(article.path) === path)
})

Handlebars.registerHelper('lookupProfile', function (profiles, domain) {
  return profiles.find(profile => profile.domain === domain)
})

Handlebars.registerHelper('uriencode', function (uri) {
  return encodeURIComponent(uri)
})

Handlebars.registerHelper('typeIcon', function (typeStr) {
  switch (typeStr) {
    case 'nonprofit':
      return 'eligibility-not-for-profit.svg'
    case 'individual':
      return 'eligibility-people-1.svg'
    case 'government':
      return 'government-2-12.svg'
    case 'educational':
      return 'education.svg'
    default:
      return 'eligibility-businesses.svg'
  }
})

Handlebars.registerHelper('eachN', function (context, options) {
  let ret = ''
  const j = Math.min(context.length, 3)
  for (let i = 0; i < j; i++) {
    ret += options.fn(context[i])
  }
  return ret
})
