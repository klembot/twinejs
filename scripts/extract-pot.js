/*
Creates src/locale/po/template.pot by scanning the application source.
*/

'use strict';
const fs = require('fs');
const glob = require('glob');
let strings = {};

function addMatch(fileName, match) {
	/*
	matches[1] is the localization comment, if any. It may have
	extra newlines and comment slashes in it.

	matches[2] is the actual string to translate.

	matches[3] is the plural form of the string, if any.
	*/

	const text = match[2];

	if (!strings[text]) {
		strings[text] = { locations: [] };
	}

	if (strings[text].locations.indexOf(fileName) === -1) {
		strings[text].locations.push(fileName);
	}
	
	if (match[1]) {
		strings[text].comment = match[1].replace(/[\t\r\n]|(\/\/)/g, '');
	}

	strings[text].plural = match[3];
}

/* 
In templates, we look for Vue filters, optionally preceded by a HTML
comment with a localization note preceded by "L10n:".
*/

glob.sync('src/**/*.html').forEach(fileName => {
	let match;
	const source = fs.readFileSync(fileName, { encoding: 'utf8' });
	const templateRegexp = new RegExp(
		/* Optional localization note in a HTML comment. */
		/(?:<!-- *L10n: *([\s\S]+)-->[\s*])?/.source +

		/* Opening moustache. */
		/{{{? */.source +

		/* String to localize and say filter. */
		/['"]([^}]*?)['"] *\| *say/.source +

		/* Optional pluralization. */
		/(?:Plural *['"](.+)['"].*)?/.source +

		/* Closing moustache. */
		/ *}}}?/.source,

		'gm'
	);

	while (match = templateRegexp.exec(source)) {
		addMatch(fileName, match);
	}
});

/*
In JavaScript files, we look for say or sayPlural function invocations,
with localization comments that begin with "L10n:".
*/

glob.sync('src/**/*.js').forEach(fileName => {
	let match;
	const source = fs.readFileSync(fileName, { encoding: 'utf8' });
	const jsRegexp = new RegExp(
		/*
		An optional localization note, set off by a line comment.  Note that we
		have to strip out extra //s and tabs if the comment extends over
		multiple lines.
		*/
		/(?:L10n: *([\s\S]*?)\s*)?/.source +
		
		/* The beginning of the say() or sayPlural() call. */
		/say(?:Plural)?\(/.source +
		
		/* The first argument, the text to localize. */
		/['"](.*?)['"]/.source +

		/* An optional second argument, the plural form. */
		/(?:, *['"](.*?)['"])?/.source +
		
		/* Extra arguments we don't care about, and closing paren. */
		/.*\)/.source,

		'gm'
	);

	while (match = jsRegexp.exec(source)) {
		addMatch(fileName, match);
	}
});

/*
Create the .pot file.
http://pology.nedohodnik.net/doc/user/en_US/ch-poformat.html has
a nice introduction to the format.
*/

fs.writeFileSync(
	'src/locale/po/template.pot',
	Object.keys(strings).reduce((result, text) => {
		let entry = strings[text];

		result += `#: ${entry.locations.join(' ')}\n`;

		if (entry.comment) {
			result += `#. ${entry.comment}\n`;
		}

		if (entry.plural) {
			result += `msgid "${text.replace(/"/g, '\"')}"\n` +
				`msgid_plural "${text.replace(/"/g, '\"')}"\n` +
				'msgstr[0] ""\n' +
				'msgstr[1] ""\n\n';
		}
		else {
			result += `msgid "${text.replace(/"/g, '\"')}"\n` +
				'msgstr ""\n\n'; 
		}

		return result;
	}, ''),
	{ encoding: 'utf8' }
);

console.log('Wrote src/locale/po/template.pot.\n');
