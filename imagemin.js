const imagemin = require('imagemin')
const imageminJpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminSvgo = require('imagemin-svgo')

imagemin(['**/*.*'], 'public/img/', {
  use: [
    imageminJpeg({
      quality: 40
    }),
    imageminPngquant(),
    imageminSvgo()
  ],
  cwd: 'source/img/'
}).then(() => {
  console.log('Images optimized')
})
