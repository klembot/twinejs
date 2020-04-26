const fs = require('fs');
const locale = process.argv[2];

const en = require('../src/locales/en-us.json');
const old = require(`./src/locales/orig/${locale}.json`);
const set = require('lodash.set');

const keyForValue = (obj, value) => {
	const keys = Object.keys(obj);
	const compValue = value.toLowerCase();

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];

		if (typeof obj[key] === 'object') {
			const innerSearch = keyForValue(obj[key], value);

			if (innerSearch !== '') {
				return `${key}.${innerSearch}`;
			}
		}

		if (typeof obj[key] === 'string' && obj[key].toLowerCase() === compValue) {
			return key;
		}
	}

	return '';
};

const skeleton = obj =>
	Object.keys(obj).reduce((result, key) => {
		const valType = typeof obj[key];

		if (valType === 'string') {
			result[key] = '';
		} else if (valType === 'object') {
			result[key] = skeleton(obj[key]);
		}

		return result;
	}, {});

const convert = src => {
	const result = skeleton(en);

	Object.keys(src).forEach(enPhrase => {
		const key = keyForValue(en, enPhrase);

		if (key) {
			set(result, key, src[enPhrase]);
		}
	});

	return result;
};

fs.writeFile(
	`./src/locales/${locale}.json`,
	JSON.stringify(convert(old)),
	{
		encoding: 'utf8'
	},
	() => console.log('done')
);
