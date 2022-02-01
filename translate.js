const fs = require('fs')
const {Translate} = require('@google-cloud/translate').v2
const translate = new Translate()

function translateText(text, targetLang) {
  return translate.translate(text, targetLang)
}

async function translateLocale(localeData, targetLang) {
  await Promise.all(Object.keys(localeData).map(async k => {
    const value = localeData[k]
    if (typeof value === 'string') {
      return translateText(value, targetLang).then(translation => {
        // console.log('Original:', value, 'Translation:', translation[0])
        localeData[k] = translation[0]
      })
    } else {
      return translateLocale(value, targetLang)
    }
  }))
  return localeData
}

const targetLang = process.argv[2]
const localeFile = process.argv[3]
const outputFile = localeFile.replace('/en/', '/fr/')
console.log(`Translating ${localeFile} to ${targetLang} and writing to ${outputFile})`)

const localeData = require(localeFile)
translateLocale(localeData, targetLang).then(data => {
  console.log(data)
  fs.writeFileSync(outputFile, JSON.stringify(data, ' ', 2))
})
