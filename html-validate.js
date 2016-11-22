const fs = require('fs-extra');
const validator = require('html-validator');

// var files = [
// 	'./public/index.html',
// 	'./public/champions/index.html',
// 	'./public/contact/index.html',
// 	'./public/faq/index.html',
// ];

var skip = [
	'Attribute “color” not allowed on element “link” at this point.'
];

const validate = function (file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, (err, data) => err ? reject(err) : resolve(data));
	}).then((data) => {
		let options = {
			data: data,
			format: 'json'
		};

		return new Promise((resolve, reject) => {
			validator(options, (err, data) => err ? reject(err) : resolve(data));
		});
	}).then((results) => {
		console.log('Validating', file);
		// console.log(data);
		results.messages.filter((entry) => {
			return ! skip.includes(entry.message);
		}).map((entry) => {
			console.log(`${entry.type.toUpperCase()}: ${entry.message} (line: ${entry.lastLine})`);
		});
		console.log();
	});
};

new Promise((resolve, reject) => {
	let files = [];
	fs.walk('./public')
		.on('data', (file) => file.path.endsWith('.html') ? files.push(file.path) : null)
		.on('end', () => resolve(files));
}).then((files) => {
	Promise.all(files.map(validate))
});