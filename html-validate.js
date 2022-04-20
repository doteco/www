const { readFile } = require('fs/promises')
const klaw = require('klaw')
const path = require('path')
const validator = require('html-validator')

const skipFiles = [
  'public/registrar/index.html',
  'public/faq/index.html',
  'public/grants/index.html',
  'public/champions/index.html',
  'public/champions/terms/index.html',
  'public/community/grants/index.html',
  'public/community/tradenames/index.html',
  'public/studies/salishsea/index.html',
  'public/names/premiums/index.html',
  'public/infographic/100days/index.html',
  'public/partners/institute-of-public-environmental-affairs/index.html',
  'public/studies/studyabroad/index.html',
  'public/studies/voltstack/index.html',
  'public/studies/vonwong/index.html',
  'public/registrars/funding/index.html',
  'public/registrars/partners/index.html',
  'public/registrars/resources/index.html',
  'public/registrars/policies/index.html',
  'public/shop/index.html',
  'public/affiliate/index.html',
  'public/frequently-asked-questions/index.html',
  'public/about/marketing/index.html',
  'public/about/team/index.html',
  'public/about/press/index.html'
]

const skip = [
  'Attribute “color” not allowed on element “link” at this point.',
  'Illegal character in query: “|” is not allowed.',
  'The “frameborder” attribute on the “iframe” element is obsolete.'
]

const validate = function (file) {
  return readFile(file, { encoding: 'utf8' }).then((data) => {
    const options = {
      data,
      format: 'json'
    }

    return validator(options)
  }).then((results) => {
    console.log('Validation results:', file)
    results.messages.filter((entry) => {
      return !skip.some(s => entry.message.includes(s))
    }).map((entry) => {
      return console.log(`${entry.type.toUpperCase()}: ${entry.message} (line: ${entry.lastLine})`)
    })
    console.log()
  }).catch((err) => {
    console.log('Failed to validate', file, err)
  })
}

new Promise((resolve, reject) => {
  const files = []
  klaw('./public').on('data', (file) => {
    const skipFile = skipFiles.some(s => s === path.relative(process.cwd(), file.path))
    return file.path.endsWith('.html') && !skipFile ? files.push(file.path) : null
  }).on('end', () => resolve(files))
}).then((files) => {
  Promise.all(files.map(validate))
})
