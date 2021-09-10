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

Handlebars.registerHelper('expandLang', function (val) {
  return val.replace('en', 'English').replace('es', 'Spanish').replace('fr', 'French').replace('de', 'German').replace(',', ', ')
})

Handlebars.registerHelper('nameAvailable', function (name, options) {
  if (name['Allocated?'] === 'checked' || name['Exclusive Broker'] === 'checked') {
    return options.inverse(this)
  } else {
    return options.fn(this)
  }
})
