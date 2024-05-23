import imagemin from 'imagemin'
import imageminJpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'

imagemin(['**/*.*'], {
  baseDirectory: 'source/img/',
  destination: 'public-img/img/',
  cwd: 'source/img',
  plugins: [
    imageminJpeg({
      quality: 40
    }),
    imageminPngquant()
  ]
}).then(files => {
  console.log('Images optimized:')
  files.forEach(f => console.log(f.sourcePath, '->', f.destinationPath))
})
