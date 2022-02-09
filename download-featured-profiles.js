const fs = require('fs')
const util = require('util')
const { google } = require('googleapis')
const { JWT } = require('google-auth-library')

const sheets = google.sheets('v4')
const writeFile = util.promisify(fs.writeFile)

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const spreadsheetId = '1DVxRuWxKh24oQPCCi1BT4CYxDrD1xs1Hyb58Rf9rDGo'
const sheetRange = 'Sheet1!A1:Z'

function getCredentials () {
  if (process.env.client_email) {
    return process.env
  }
  return require('./privatekey.json')
}

function getAuthToken (email, key, projectId) {
  console.log(`Authorizing ${projectId} for ${email}`)
  return new JWT({
    email,
    key,
    scopes: SCOPES
  })
}

async function getSpreadSheetValues (spreadsheetId, auth, sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName
  })
  return res
}

const { client_email, private_key, project_id } = getCredentials()

getSpreadSheetValues(
  spreadsheetId,
  getAuthToken(client_email, private_key, project_id),
  sheetRange
).then(response => {
  const rows = response.data.values

  rows.shift() // topline
  const headers = rows.shift()
  const h = headers.reduce((h, header, i) => {
    h[header] = i
    return h
  }, {})

  const profiles = rows.map(data => {
    return {
      domain: data[h['.eco domain']],
      story: data[h.Story]?.trim(),
      img: data[h.Image]?.trim(),
      type: data[h.Type]?.trim(),
      location: data[h.Country]?.trim(),
      live: data[h.Live] === 'Y'
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

  console.log('Valid featured profiles:', profiles.length, profiles)
  return profiles
}).then(profiles => writeFile('./locales/en/featured-profiles.json', JSON.stringify(profiles, null, 2), 'utf-8'))
