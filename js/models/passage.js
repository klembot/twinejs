// A passage belongs to a story.

Passage = Backbone.Model.extend(
{
	defaults:
	{
		story: -1,
		top: 0,
		left: 0,
		name: 'Untitled Passage',
		text: 'Double-click this passage to edit it.'
	},

	template: _.template('<div data-id="<%- id %>" data-name="<%- name %>" ' +
						 'data-type="text/markdown" data-twine-position="<%- left %>,<%- top %>">' +
						 '<%- text %></div>'),

	initialize: function()
	{
		var self = this;

		this.on('sync', function()
		{
			// if any stories are using this passage's cid
			// as their start passage, update with a real id

			window.app.stories.fetch(
			{
				success: function (stories)
				{
					var parents = stories.where({ startPassage: self.cid });

					for (var i = 0; i < parents.length; i++)
						parents[i].save({ startPassage: self.id });
				}
			});
		});
	},

	excerpt: function()
	{
		var text = this.get('text');

		if (text.length > 100)
			return text.substr(0, 99) + '&hellip;';
		else
			return text;
	},

	links: function()
	{
		var matches = this.get('text').match(/\[\[.*?\]\]/g);
		var result = [];

		if (matches)
			for (var i = 0; i < matches.length; i++)
				result.push(matches[i].replace(/[\[\]]/g, '').replace(/\|.*/, ''));

		return result;
	},

	publish: function (id)
	{
		return this.template({
			id: id,
			name: this.get('name'),
			left: this.get('left'),
			top: this.get('top'),
			text: this.get('text')
		});
	}
});
