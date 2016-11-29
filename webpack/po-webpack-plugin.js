/*
A Webpack plugin to convert .po files to JSONP format. We do this instead of
using po-loader so that they exist as separate files that only are loaded as
needed.

This uses synchronous operations everywhere, and thus could stand to be
optimized.
*/

'use strict';
const glob = require('glob');
const path = require('path');
const po2json = require('po2json');

function PoPlugin(options) {
	this.sources = glob.sync(options.src);
	this.dest = options.dest;
	this.convertOptions = options.options;
}

PoPlugin.prototype.apply = function(compiler) {
	compiler.plugin('emit', (compilation, callback) => {
		this.sources.forEach(filename => {
			const source = 'window.locale(' +
				JSON.stringify(
					po2json.parseFileSync(filename, this.convertOptions)
				) + ');';
			const outputFilename = path.join(
				this.dest,
				path.basename(filename, '.po') + '.js'
			);

			compilation.assets[outputFilename] = {
				source() { return source; },
				size() { return source.length; }
			};
		});

		callback();
	});
};

module.exports = PoPlugin;
