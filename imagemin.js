const imagemin = require('imagemin');
const imageminJpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

imagemin(['**/*.*'], 'public/img', {
	use: [
		imageminJpeg(),
		imageminPngquant()
	], cwd: "source/img"
}).then(() => {
    console.log('Images optimized');
});