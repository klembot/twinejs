/**
 A template transforms a story's HTML output into a full-fledged
 HTML page. It contains placeholders, by convention named like UPPERCASE_CONSTANTS,
 that the story's published output is plugged into.

 @class Template
 @extends Backbone.Model
**/

var Template = Backbone.Model.extend(
{
	defaults:
	{
		source: '{{STORY_NAME}} {{STORY_DATA}}',
		placeholders: []
	},

	/**
	 Publishes a story with this template.

	 @method publish
	 @param {Story} story Story to publish.
	 @param {Array} options Array of options to pass to the story, optional
	 @return {String} HTML source
	**/

	publish: function (story, options)
	{
		var output = this.get('source');
		
		// builtin placeholders

		output = output.replace(/{{STORY_NAME}}/g, _.escape(story.get('name')));
		output = output.replace(/{{STORY_DATA}}/g, story.publish(options));

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
