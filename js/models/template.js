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
	 @method publish
	 @param {Story} story Story to publish.
	 @param {Function} callback Function to call when done; this is passed the
	                            final HTML output.
	**/

	publish: function (story, callback)
	{
		var self = this;

		story.publish(function (storyData)
		{
			var output = self.get('source');
			
			// builtin placeholders

			output = output.replace(/{{STORY_NAME}}/g, _.escape(story.get('name')));
			output = output.replace(/{{STORY_DATA}}/g, storyData);

			// user-defined placeholders

			_.each(self.get('placeholders'), function (p)
			{
				var value = story.get(p.name);

				if (value !== null)
					output = output.replace(p.name, value);
			});

			callback(output);
		});
	}
});

