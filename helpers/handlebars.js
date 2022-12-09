const Handlebars = require('handlebars')
const dateFormat = require('date-fns/format')

Handlebars.registerHelper('equal', function (lvalue, rvalue) {
  return lvalue === rvalue
})

Handlebars.registerHelper('notequal', function (lvalue, rvalue) {
  return lvalue !== rvalue
})

Handlebars.registerHelper('checkActive', function (current, active) {
  return current === active ? 'active' : ''
})

Handlebars.registerHelper('json', function (object) {
  return new Handlebars.SafeString(JSON.stringify(object))
})

Handlebars.registerHelper('concat', (a, b) => a + b)

Handlebars.registerHelper('isoDate', date => date && date.toISOString())

Handlebars.registerHelper('formatDay', date => date && dateFormat(date, 'MMM d, yyyy'))

Handlebars.registerHelper('formatUTC', date => date && dateFormat(date, 'yyyy-MM-dd'))

Handlebars.registerHelper('pagePath', path => path?.replace(/index\..*$/, ''))

Handlebars.registerHelper('newsColumns', index => (index % 4 === 0 || index % 4 === 3) ? 5 : 7)

Handlebars.registerHelper('typeIcon', function (typeStr) {
  switch (typeStr) {
    case 'nonprofit':
      return 'nonprofit.svg'
    case 'individual':
      return 'individual.svg'
    case 'government':
      return 'government.svg'
    case 'educational':
      return 'educational.svg'
    default:
      return 'business.svg'
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
