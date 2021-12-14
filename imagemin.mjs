import imagemin from 'imagemin'
import imageminJpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'

imagemin(['**/*.*'], {
  baseDirectory: 'source/img/',
  destination: 'public/img/',
  cwd: 'source/img',
  plugins: [
    imageminJpeg({
      quality: 40
    }),
    imageminPngquant(),
    imageminSvgo()
  ]
}).then(files => {
  console.log(files)
  console.log('Images optimized:')
  files.forEach(f => console.log(f.sourcePath, '->', f.destinationPath))
})
