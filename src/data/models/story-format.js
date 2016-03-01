/**
 A story format transforms a story's HTML output into a full-fledged HTML page.
 It contains placeholders, by convention named like UPPERCASE_CONSTANTS, that
 the story's published output is plugged into. Although this has a traditional
 numeric id, a story format's true primary key is its name. This is so that if
 stories are traded among users, links between stories and formats will be
 retained.

 This model is just a pointer to data that is loaded via JSONP.

 @class StoryFormat
 @extends Backbone.Model
**/

'use strict';
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var locale = require('../../locale');

var StoryFormat = Backbone.Model.extend({
	/**
	 Remembers whether the format has been loaded yet.

	 @property loaded
	 @type Boolean
	**/
	loaded: false,

	/**
	 Properties set by the external format file-- notably,
	 the format source. To load these, call load().

	 @property properties
	 @type Object
	**/
	properties: {},

	defaults: _.memoize(function() {
		return {
			name: locale.say('Untitled Story Format'),
			url: '',
			userAdded: true
		};
	}),

	/**
	 Loads the actual story format via a JSONP request. After this
	 call, its data is available under the properties property.

	 Because the JSONP request is asynchronous, properties will almost
	 certainly not be available immediately after this returns. Pass a
	 callback to be guaranteed when properties are available.

	 If the format has been previously loaded, then this will have no effect,
	 and the callback will be called immediately.

	 @method load
	 @param {Function} callback Function to call when loading completes; if it
		did not succeed, the function will be passed an Error object. If none
		is specified, an error is raised directly.
	**/

	load(callback) {
		if (this.loaded) {
			if (callback) { callback(); }

			return;
		};

		$.ajax({
			url: this.get('url'),
			dataType: 'jsonp',
			jsonpCallback: 'storyFormat',
			crossDomain: true
		})
		.done(function done(properties) {
			this.properties = properties;
			this.loaded = true;

			if (this.properties.setup) {
				this.properties.setup.call(this);
			}

			if (callback) {	callback(); }
		}.bind(this))
		.fail(function failed(req, status, error) {
			if (callback) {
				callback(error);
			}
			else {
				throw error;
			}
		});
	},

	/**
	 Publishes a story with this story format. This method is asynchronous.

	 @method publish
	 @param {Story} story Story to publish.
	 @param {Array} options Array of options to pass to the story, optional
	 @param {Number} startId Passage database ID to start with, overriding the
		model; optional
	 @param {Function} callback Function called with the resulting HTML,
		signature callback(err, result)
	**/

	publish(story, options, startId, callback) {
		this.load(function(err) {
			if (err) {
				callback(err);
				return;
			}

			try {
				var output = this.properties.source;

				// use function replacements to protect the data from
				// accidental interactions with the special string
				// replacement patterns

				// builtin placeholders

				output = output.replace(/{{STORY_NAME}}/g, function() {
					return _.escape(story.get('name'));
				});

				output = output.replace(/{{STORY_DATA}}/g, function() {
					return story.publish(options, startId);
				});

				// user-defined placeholders

				_.each(this.get('placeholders'), function(p) {
					var value = story.get(p.name);

					if (value !== null) {
						output = output.replace(p.name, function() {
							return value;
						});
					}
				});

				callback(null, output);
			}
			catch (e) {
				callback(e);
			};
		}.bind(this));
	}
});

// Harlowe compatibility

window.StoryFormat = StoryFormat;

// early export to avoid circular reference problems

module.exports = StoryFormat;

var StoryFormatCollection = require('../collections/story-format');

/**
 Locates a StoryFormat by name. If none exists, then this returns null.

 @method withName
 @param {String} name name of the story format
 @static
 @return {StoryFormat} matching story format
 **/

StoryFormat.withName = function(name) {
	return StoryFormatCollection.all().findWhere({ name: name });
};
