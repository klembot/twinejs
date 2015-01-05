/**
 A story format transforms a story's HTML output into a full-fledged
 HTML page. It contains placeholders, by convention named like UPPERCASE_CONSTANTS,
 that the story's published output is plugged into. Although this has a traditional
 numeric id, a story format's true primary key is its name. This is so that if
 stories are traded among users, links between stories and formats will be retained.

 This model is just a pointer to data that is loaded via JSONP. 

 @class StoryFormat
 @extends Backbone.Model
**/

'use strict';

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
		userAdded: true,
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
	 @param {Function} callback Function to call when loading completes; if it did
	                            not succeed, the function will be passed an Error object.
								If none is specified, an error is raised directly.
	**/

	load: function (callback)
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

			if (callback)
				callback();
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

			if (! this.loaded)
			{
				var err = new Error('Story format source did not call window.storyFormat()');

				if (callback)
					callback(err);
				else
					throw err;
			};

			// regardless, remove the loader

			loader.remove();
		}, this))
		.on('error', _.bind(function ()
		{
			var err = new Error('Could not load story format source');

			if (callback)
				callback(err);
			else
				throw err;
			
			loader.remove();
		}, this));

		// add cache-busting

		loader.attr('src', this.get('url') + '?' + new Date().getTime());

		// in case the error event doesn't fire on a loading error,
		// we set a timeout (10 seconds) that removes the loader
		// element and triggers the failure handler

		window.setTimeout(_.bind(function()
		{
			if (loader.parent().length > 0)
			{
				var err = new Error('Could not load story format source');

				if (callback)
					callback(err);
				else
					throw err;
				
				loader.remove();
			};
			
		}, this), 10000);
	},

	/**
	 Publishes a story with this story format. This method is asynchronous.

	 @method publish
	 @param {Story} story Story to publish.
	 @param {Array} options Array of options to pass to the story, optional
	 @param {Number} startId Passage database ID to start with, overriding the model; optional
	 @param {Function} callback Function called with the resulting HTML, signature callback(err, result)
	**/

	publish: function (story, options, startId, callback)
	{
		this.load(_.bind(function (err)
		{
			if (err)
			{
				callback(err);
				return;
			};

			var output = this.properties.source;

			// use function replacements to protect the data from accidental
			// interactions with the special string replacement patterns

			// builtin placeholders

			output = output.replace(/{{STORY_NAME}}/g, function ()
			{
				return _.escape(story.get('name'));
			});
			output = output.replace(/{{STORY_DATA}}/g, function ()
			{
				return story.publish(options, startId);
			});

			// user-defined placeholders

			_.each(this.get('placeholders'), function (p)
			{
				var value = story.get(p.name);

				if (value !== null)
					output = output.replace(p.name, function ()
					{
						return value;
					});
			});

			callback(null, output);
		}, this));
	}
});

/**
 Locates a StoryFormat by name. If none exists, then this returns null.

 @method withName
 @param {String} name name of the story format
 @static
 @return {StoryFormat} matching story format
 **/

StoryFormat.withName = function (name)
{
	return StoryFormatCollection.all().findWhere({ name: name });
};
