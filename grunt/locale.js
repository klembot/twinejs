module.exports = function(grunt) {
	/*
	pot creates src/locale/po/template.pot by scanning the application source.
	*/

	grunt.registerTask('pot', function() {
		var strings = {};

		function addMatch(fileName, match) {
			/*
			matches[1] is the localization comment, if any. It may have
			extra newlines and comment slashes in it.

			matches[2] is the actual string to translate.

			matches[3] is the plural form of the string, if any.
			*/

			var text = match[2];

			if (!strings[text]) {
				strings[text] = { locations: [] };
			}

			if (strings[text].locations.indexOf(fileName) === -1) {
				strings[text].locations.push(fileName);
			}
			
			strings[text].comment = match[1];
			strings[text].plural = match[3];
		}

		/* 
		In templates, we look for Vue filters, optionally preceded by a HTML
		comment with a localization note preceded by "L10n:".
		*/

		var templates = grunt.file.expand('src/**/*.html');

		templates.forEach(function(fileName) {
			var match;
			var source = grunt.file.read(fileName);
			var templateRegexp = new RegExp(
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
		with localization comments that begin with "L10n:". Right now, only
		line comments (starting with //) are extracted.
		*/

		var js = grunt.file.expand('src/**/*.js');

		js.forEach(function(fileName) {
			var match;
			var source = grunt.file.read(fileName);
			var jsRegexp = new RegExp(
				/*
				An optional localization note, set off by a line comment.
				Note that we have to strip out extra //s if the comment extends
				over multiple lines.
				*/
				/(?:\/\/ *L10n: *([\s\S]*?)\s*)?/.source +
				
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

		grunt.file.write(
			'src/locale/po/template.pot',
			Object.keys(strings).reduce(function(result, text) {
				var entry = strings[text];

				result += '#: ' + entry.locations.join(' ') + '\n';

				if (entry.comment) {
					result += '#. ' + entry.comment + '\n';
				}

				if (entry.plural) {
					result += 'msgid "' + text.replace(/"/g, '\"') + '"\n' +
						'msgid_plural "' + text.replace(/"/g, '\"') + '"\n' +
						'msgstr[0] ""\n' +
						'msgstr[1] ""\n\n';
				}
				else {
					result += 'msgid "' + text.replace(/"/g, '\"') + '"\n' +
						'msgstr ""\n\n'; 
				}

				return result;
			}, '')
		);
	});

	/*
	po2json converts .po files in src/locale/po to readable form. These need
	touching up in order to be loaded by Twine as JSONP...
	*/

	grunt.config('po2json', {
		default: {
			src: 'src/locale/po/*.po',
			dest: 'build/standalone/locale/'
		},
		cdn: {
			src: 'src/locale/po/*.po',
			dest: 'build/cdn/locale/'
		},
		options: {
			format: 'jed1.x',
			domain: 'messages'
		}
	});

	// pocleanup takes the results of po2json and puts the files into a format
	// that Twine can use.

	grunt.registerTask('pojson2jsonp', function() {
		grunt.file.expand('build/standalone/locale/*.json').forEach(function(path) {
			var src = grunt.file.read(path);

			/*
			\\/ => \/, because extraneous slashes have been an issue.
			*/

			src = src.replace(/\\\\\//g, '\\/');

			/* Add the JSONP frame. */

			src = 'window.locale(' + src + ')';

			/* Save it to file. */

			var newPath = path.replace(/\.json$/, '.js');
			grunt.file.write(newPath, src);
			grunt.file.delete(path, {force:true});

			grunt.log.writeln(newPath + ' created.');
		});
	});

	grunt.registerTask('pojson2jsonp:cdn', function() {
		grunt.file.expand('build/cdn/locale/*.json').forEach(function(path) {
			var src = grunt.file.read(path);

			/*
			\\/ => \/, because extraneous slashes have been an issue.
			*/

			src = src.replace(/\\\\\//g, '\\/');

			/* Add the JSONP frame. */

			src = 'window.locale(' + src + ')';

			/* Save it to file. */

			var newPath = path.replace(/\.json$/, '.js');
			grunt.file.write(newPath, src);
			grunt.file.delete(path, {force:true});

			grunt.log.writeln(newPath + ' created.');
		});
	});

	grunt.registerTask('po', ['po2json', 'pojson2jsonp']);
	grunt.registerTask('po:cdn', ['po2json:cdn', 'pojson2jsonp:cdn']);
};
