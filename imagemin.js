const imagemin = require('imagemin')
const imageminJpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminSvgo = require('imagemin-svgo')

imagemin(['source/img/*.*'], 'public/img/', {
  use: [
    imageminJpeg({
      quality: 40
    }),
    imageminPngquant(),
    imageminSvgo()
  ]
}).then(() => {
  console.log('Images optimized')
})
