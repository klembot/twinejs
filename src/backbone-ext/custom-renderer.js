'use strict';
var _ = require('underscore');
var moment = require('moment');
var locale = require('../locale');
var Marionette = require('backbone.marionette');

module.exports =
{
	init: function()
	{
		// add i18n hook to Marionette's rendering

		var templateProperties =
		{
			moment: moment,
			s: locale.say.bind(locale),
			sp: locale.sayPlural.bind(locale)
		};

		Marionette.Renderer.render = function (template, data)
		{
			if (typeof template !== 'function')
				throw new Error(locale.say('Asked to render a non-function template ' + template));
			return template(_.extend(data || {}, templateProperties));
		};
	}
}
