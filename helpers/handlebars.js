const Handlebars = require('handlebars')
const dateFormat = require('date-fns/format')

Handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
  if (arguments.length < 3) {
    throw new Error('Handlebars Helper equal needs 2 parameters')
  }
  if (lvalue !== rvalue) {
    return options.inverse(this)
  } else {
    return options.fn(this)
  }
})

Handlebars.registerHelper('json', function (object) {
  return new Handlebars.SafeString(JSON.stringify(object))
})

Handlebars.registerHelper('concat', (a, b) => a + b)

Handlebars.registerHelper('isoDate', date => date && date.toISOString())

Handlebars.registerHelper('formatDay', date => date && dateFormat(date, 'MMM d, yyyy'))

Handlebars.registerHelper('pagePath', path => path?.replace(/index.md$/, ''))

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
