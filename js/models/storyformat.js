/**
 A story format transforms a story's HTML output into a full-fledged
 HTML page. It contains placeholders, by convention named like UPPERCASE_CONSTANTS,
 that the story's published output is plugged into.

 This model is just a pointer to data that is loaded via JSONP.

 @class StoryFormat
 @extends Backbone.Model
**/

var StoryFormat = Backbone.Model.extend(
{
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

	defaults:
	{
		name: 'Untitled Story Format',
		url: '',
	},

	/**
	 Loads the actual story format via a JSONP request. After this
	 call, its data is available under the properties property.

	 Because the JSONP request is asynchronous, properties will almost
	 certainly not be available immediately after this returns. Pass a
	 callback to be guaranteed when properties are available.

	 If the format has been previously loaded, then this will have no effect,
	 and the callback will be called immediately.

	 @method load
	 @param {Function} success Function to call if loading completes successfully
	 @param {Function} failure Function to call if loading completes unsuccessfully;
	                           will be passed error message
	**/

	load: function (success, failure)
	{
		if (this.loaded)
		{
			if (callback)
				callback();

			return;
		};

		window.storyFormat = _.bind(function (properties)
		{
			this.properties = properties;
			this.loaded = true;
			window.storyFormat = null;

			if (success)
				success();
		}, this);

		// We have to do a song and dance here
		// because we can't use an XHR if we're running locally...
		// but browsers will allow a <script> tag.
		// jQuery also seems to be clever and notices that if we add a <script>
		// tag with a src attribute immediately, it does an XHR on our behalf.

		var loader = $('<script></script>');

		$('body').append(loader);
		loader.on('load', _.bind(function()
		{
			// if our loaded property is not set,
			// then something went wrong

			if (failure && ! this.loaded)
				failure('Story format source did not call window.storyFormat()');

			// regardless, remove the loader

			loader.remove();
		}, this));

		// add cache-busting
		loader.attr('src', this.get('url') + '?' + new Date().getTime());

		// because there's no load failure event to listen to,
		// we set a timeout (10 seconds) that removes the loader
		// element and triggers the failure handler

		var failTimer = window.setTimeout(_.bind(function()
		{
			if (failure && ! this.loaded)
				failure('Could not load story format source');
			
			loader.remove();
		}, this), 10000);
	},

	/**
	 Publishes a story with this story format.

	 @method publish
	 @param {Story} story Story to publish.
	 @param {Array} options Array of options to pass to the story, optional
	 @param {Number} startId passage database ID to start with, overriding the model; optional
	 @return {String} HTML source
	**/

	publish: function (story, options, startId)
	{
		var output = this.properties.source;
		
		// builtin placeholders

		output = output.replace(/{{STORY_NAME}}/g, _.escape(story.get('name')));
		output = output.replace(/{{STORY_DATA}}/g, story.publish(options, startId));

		// user-defined placeholders

		_.each(this.get('placeholders'), function (p)
		{
			var value = story.get(p.name);

			if (value !== null)
				output = output.replace(p.name, value);
		});

		return output;
	}
});
