const fs = require('fs')
const { TranslationServiceClient } = require('@google-cloud/translate')
const translate = new TranslationServiceClient()
const projectId = 'profiles-eco'

function translateText (text, targetLang) {
  const request = {
    parent: `projects/${projectId}/locations/global`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'en',
    targetLanguageCode: targetLang
  }
  return translate.translateText(request)
}

const targetLang = process.argv[2]
const localeFile = process.argv[3]
const outputFile = localeFile.replace('/en/', `/${targetLang}/`)
console.log(`Translating ${localeFile} to ${targetLang} and writing to ${outputFile})`)

const content = fs.readFileSync(localeFile).toString()
translateText(content, targetLang).then(response => {
  const translation = response[0].translations[0].translatedText
  fs.writeFileSync(outputFile, translation)
})
