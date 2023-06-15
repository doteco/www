const fs = require('fs')
const util = require('util')
const { google } = require('googleapis')

const sheets = google.sheets('v4')
const writeFile = util.promisify(fs.writeFile)

const { Translate } = require('@google-cloud/translate').v2
const translator = new Translate()

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const spreadsheetId = '1DVxRuWxKh24oQPCCi1BT4CYxDrD1xs1Hyb58Rf9rDGo'
const sheetRange = 'Sheet1!A1:Z'

async function getSpreadSheetValues (spreadsheetId, sheetName) {
  console.log(`Authorization using ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
  const auth = await google.auth.getClient({
    scopes: SCOPES
  })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName
  })
  return res
}

async function parseSpreadsheet (response) {
  const rows = response.data.values

  rows.shift() // topline
  const headers = rows.shift()
  const h = headers.reduce((h, header, i) => {
    h[header] = i
    return h
  }, {})

  return rows.map(data => {
    return {
      domain: data[h['.eco domain']],
      story: data[h.Story]?.trim(),
      img: data[h.Image]?.trim(),
      type: data[h.Type]?.trim(),
      location: data[h.Country]?.trim(),
      live: data[h.Live] === 'Y',
      sector: data[h.Sector],
      priority: {
        en: data[h['Priority - EN']],
        fr: data[h['Priority - FR']],
        de: data[h['Priority - DE']]
      }
    }
  }).filter(p => {
    if (!p.live) return false
    if (!p.domain) {
      console.log('Missing domain', p)
    } else if (!p.story) {
      console.log('Missing story', p)
    } else if (!p.img) {
      console.log('Missing image', p)
    } else if (!p.type) {
      console.log('Missing type', p)
    } else if (!p.location) {
      console.log('Missing location', p)
    } else {
      return true
    }
    return false
  })
}

async function translate (text, locale) {
  if (locale === 'en') return text

  try {
    if (text === 'USA') text = 'United States'
    const tr = await translator.translate(text, locale)
    return tr[0]
  } catch (ex) {
    console.log(`Error translating ${text} into ${locale}. Returning original text.`)
    return text
  }
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Need to define environment variable GOOGLE_APPLICATION_CREDENTIALS to run. eg. GOOGLE_APPLICATION_CREDENTIALS=<file> node ./download-featured-profiles.js')
  process.exit()
}

getSpreadSheetValues(
  spreadsheetId,
  sheetRange
).then(response => {
  const profiles = parseSpreadsheet(response)
  console.log('Valid featured profiles:', profiles.length, profiles)
  return profiles
}).then(profiles => {
  return Promise.all(['en', 'fr', 'de'].map(async locale => {
    const localizedProfiles = await Promise.all(profiles.map(async p => {
      let localizedStory = await translate(p.story, locale)
      if (locale === 'fr') {
        localizedStory = localizedStory.replace(/\s,/g, '&nbsp;,')
      }
      let localizedLocation = await translate(p.location, locale)
      if (localizedLocation === 'ROYAUME-UNI') localizedLocation = 'Royaume-Uni'

      return {
        domain: p.domain,
        story: localizedStory,
        img: p.img,
        type: p.type,
        sector: p.sector,
        location: localizedLocation,
        priority: p.priority[locale]
      }
    }))
    return writeFile(`./locales/${locale}/featured-profiles.json`, JSON.stringify(localizedProfiles, null, 2), 'utf-8')
  }))
})
