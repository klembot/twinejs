// This is a little different from Story and Passage in that
// it does not extend Backbone.Model. Instead it manages access
// to a template file, and binding a story file to it.

define(['backbone', 'backbone.localstorage'],

function (Backbone)
{
	var Template = Backbone.Model.extend(
	{
		defaults:
		{
			source: '{{STORY_NAME}} {{STORY_DATA}}',
			placeholders: []
		},

		publish: function (story)
		{
			var output = this.get('source');
			
			// builtin placeholders

			output = output.replace(/{{STORY_NAME}}/g, _.escape(story.get('name')));
			output = output.replace(/{{STORY_DATA}}/g, story.publish());

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

	return Template;
});
