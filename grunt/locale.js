var _ = require('underscore');
var childProcess = require('child_process');

module.exports = function(grunt) {
	// Pot creates src/locale/po/template.pot by scanning the application source.
	// This requires that xgettext is available in the system.

	grunt.registerTask('pot', function() {
		// We use PHP mode with Underscore templates since it seems to be OK
		// with random HTML interspersed everywhere :)
		// only downside is we cannot use string concatenation

		var templates = grunt.file.expand('src/**/ejs/*.ejs');

		childProcess.execSync(
			'xgettext -L PHP -ks -ksp:1,2 -cL10n ' +
			'-o src/locale/po/template.pot '
			+ templates.join(' ')
		);

		var js = grunt.file.expand('src/**/*.js');

		childProcess.execSync(
			'xgettext -j -L JavaScript -ksay -ksayPlural:1,2 -cL10n ' +
			'-o src/locale/po/template.pot ' +
			js.join(' ')
		);
	});

	// Po2json converts .po files in src/locale/po to readable form.
	// These need touching up in order to be loaded by Twine as JSONP...

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

	// Pocleanup takes the results of po2json and puts the files into a format
	// that Twine can use.

	grunt.registerTask('pojson2jsonp', function() {
		_.each(grunt.file.expand('build/standalone/locale/*.json'), function(path) {
			var src = grunt.file.read(path);

			// \\/ => \/, because xgettext isn't handling backslashes in templates
			// correctly

			src = src.replace(/\\\\\//g, '\\/');

			// Add JSONP frame

			src = 'window.locale(' + src + ')';

			// Write it out

			var newPath = path.replace(/\.json$/, '.js');

			grunt.file.write(newPath, src);
			grunt.file.delete(path);

			grunt.log.writeln(newPath + ' created.');
		});
	});

	grunt.registerTask('pojson2jsonp:cdn', function() {
		_.each(grunt.file.expand('build/cdn/locale/*.json'), function(path) {
			var src = grunt.file.read(path);

			// \\/ => \/, because xgettext isn't handling backslashes in templates
			// correctly

			src = src.replace(/\\\\\//g, '\\/');

			// Add JSONP frame

			src = 'window.locale(' + src + ')';

			// Write it out

			var newPath = path.replace(/\.json$/, '.js');

			grunt.file.write(newPath, src);
			grunt.file.delete(path);

			grunt.log.writeln(newPath + ' created.');
		});
	});

	grunt.registerTask('po', ['po2json', 'pojson2jsonp']);
	grunt.registerTask('po:cdn', ['po2json:cdn', 'pojson2jsonp:cdn']);
};
