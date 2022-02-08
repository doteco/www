const Handlebars = require('handlebars')

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

Handlebars.registerHelper('typeIcon', function (typeStr) {
  switch (typeStr) {
    case 'Non-profit':
      return 'nonprofit.svg'
    case 'Individual':
      return 'individual.svg'
    case 'Government':
      return 'government.svg'
    case 'Educiational':
      return 'educational.svg'
    default:
      return 'business.svg'
  }
})
