// A passage belongs to a story.

Passage = Backbone.Model.extend({
	defaults:
	{
		story: -1,
		title: 'Untitled Passage',
		text: 'Double-click this passage to edit it.'
	},

	excerpt: function()
	{
		var text = this.get('text');

		if (text.length > 20)
			return text.substr(0, 19) + '&hellip;';
		else
			return text;
	}
});
