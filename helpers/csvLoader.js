const csv = require('fast-csv')

module.exports = (opts) => {
  return (files, metalsmith, done) => {
    return Promise.all(Object.keys(files).map(file => {
      const meta = files[file]
      if (meta.data) {
        const csvFile = metalsmith.path(metalsmith.source(), file, '..', meta.data)

        const rows = []
        return new Promise((resolve, reject) => {
          csv.parseFile(csvFile, { headers: true }).on('data', (data) => {
            rows.push(data)
          }).on('end', () => {
            meta.rows = rows
            console.log('Loaded file:', csvFile, 'rows:', meta.rows.length)
            resolve()
          })
        })
      }
      return null
    })).then(() => done())
  }
}
