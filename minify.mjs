import sharp from 'sharp'

const quality = 50

function outputOptions (format) {
  switch (format) {
    case 'jpeg':
      return {
        quality,
        mozjpeg: true
      }
    default:
      return { quality }
  }
}
async function minify (inputFile, format = 'webp') {
  let outputFile = inputFile // inputFile.replace(/^source/, 'public-img')
  outputFile = outputFile.replace(/\.[^.]+$/, '.' + format)
  console.log(`Converting ${inputFile} to ${outputFile}`)

  await sharp(inputFile)[format](outputOptions(format)).toFile(outputFile)
}

const inputFile = process.argv[2]
const format = process.argv[3]
await minify(inputFile, format)
