const imagemin = require('imagemin');
const imageminJpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

imagemin(['source/img/**/*.{jpg,png}'], 'public/', {
	use: [
		imageminJpeg(),
		imageminPngquant()
	], cwd: "source"
}).then(() => {
    console.log('Images optimized');
});