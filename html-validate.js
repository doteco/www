const fs = require('fs-extra')
const path = require('path')
const validator = require('html-validator')

var skipFiles = [
  'public/registrar/index.html',
  'public/grants/index.html',
  'public/policies/index.html'
]

var skip = [
  'Attribute “color” not allowed on element “link” at this point.',
  'Illegal character in query: “|” is not allowed.',
  'The “frameborder” attribute on the “iframe” element is obsolete.'
]

const validate = function (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => err ? reject(err) : resolve(data))
  }).then((data) => {
    const options = {
      data: data,
      format: 'json'
    }

    return new Promise((resolve, reject) => {
      validator(options, (err, data) => err ? reject(err) : resolve(data))
    })
  }).then((results) => {
    console.log('Validating', file)
    // console.log(results);
    results.messages.filter((entry) => {
      return !skip.some(s => entry.message.includes(s))
    }).map((entry) => {
      console.log(`${entry.type.toUpperCase()}: ${entry.message} (line: ${entry.lastLine})`)
    })
    console.log()
  }).catch((err) => {
    console.log('Failed to validate', file, err)
  })
}

new Promise((resolve, reject) => {
  const files = []
  fs.walk('./public').on('data', (file) => {
    const skipFile = skipFiles.some(s => s === path.relative(process.cwd(), file.path))
    return file.path.endsWith('.html') && !skipFile ? files.push(file.path) : null
  }).on('end', () => resolve(files))
}).then((files) => {
  Promise.all(files.map(validate))
})
