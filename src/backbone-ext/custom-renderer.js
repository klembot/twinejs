/*
# custom-renderer

This module sets Marionette's built-in template renderer to one that renders
precompiled templates (that were created by ejsify). It also provides some
helpful properties to the templates:

- `moment`: direct access to Moment.js
- `s`: access to locale.say()
- `sp`: access to locale.sayPlural()
*/

'use strict';
var _ = require('underscore');
var moment = require('moment');
var locale = require('../locale');
var Marionette = require('backbone.marionette');

module.exports = {
	/*
	Sets this renderer as Marionette's default.

	@method initialize
	*/
	initialize: function() {
		var templateProperties = {
			moment: moment,
			s: locale.say.bind(locale),
			sp: locale.sayPlural.bind(locale)
		};

		Marionette.Renderer.render = function(template, data) {
			if (typeof template !== 'function') {
				throw new Error(locale.say('Asked to render a non-function template '
					+ template));
			};

			return template(_.extend(data || {}, templateProperties));
		};
	}
};
