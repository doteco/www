const { readFile } = require('fs/promises')
const klaw = require('klaw')
const path = require('path')

async function importPMap () {
  return (await import('p-map')).default
}

const skipFiles = [
  'public/registrar/index.html',
  'public/champions/terms/index.html',
  'public/community/grants/index.html',
  'public/community/tradenames/index.html',
  'public/studies/salishsea/index.html',
  'public/names/premiums/index.html',
  'public/infographic/100days/index.html',
  'public/partners/institute-of-public-environmental-affairs/index.html',
  'public/studies/goodonyou/index.html',
  'public/studies/koala/index.html',
  'public/studies/studyabroad/index.html',
  'public/studies/voltstack/index.html',
  'public/studies/vonwong/index.html',
  'public/registrars/funding/index.html',
  'public/registrars/partners/index.html',
  'public/registrars/policies/index.html',
  'public/shop/index.html',
  'public/affiliate/index.html',
  'public/frequently-asked-questions/index.html',
  'public/about/marketing/index.html',
  'public/bthechange2017/index.html',
  'public/about/index.html',
  'public/about/team/index.html',
  'public/about/press/index.html',
  'public/news/understanding-your-aim-1d02eebce1e8/index.html',
  'public/news/first-ever-domain-grants-program-wraps-up-583234092c10/index.html',
  'public/news/the-world-needs-more-tigers-13eb6e5eb394/index.html',
  'public/feed/index.html',
  'public/news/feed/index.html',
  'public/rss/index.html',
  'public/the-eco-story/index.html'
]

const validate = async function (file) {
  try {
    const data = await readFile(file, { encoding: 'utf8' })
    const validateUrl = 'https://validator.w3.org/nu/?out=json'
    const response = await fetch(validateUrl, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) {
      throw new Error('Error getting validation results from W3: ' + response.status)
    }
    const results = await response.json()
    console.log('Validation results:', file)
    results.messages.map(entry => {
      return console.log(`${entry.type.toUpperCase()}: ${entry.message} (line: ${entry.lastLine})`)
    })
    console.log()
  } catch (err) {
    console.log('Failed to validate', file, err)
  }
}

new Promise((resolve, reject) => {
  const files = []
  klaw('./public').on('data', (file) => {
    const skipFile = skipFiles.some(s => s === path.relative(process.cwd(), file.path))
    return file.path.endsWith('.html') && !skipFile ? files.push(file.path) : null
  }).on('end', () => resolve(files))
}).then(async files => {
  const pMap = await importPMap()
  await pMap(files, validate, { concurrency: 1 })
})
