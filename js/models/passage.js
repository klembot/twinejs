// A passage belongs to a story.

Passage = Backbone.Model.extend({
	defaults:
	{
		story: -1,
		name: 'Untitled Passage',
		text: 'Double-click this passage to edit it.'
	},

	excerpt: function()
	{
		var text = this.get('text');

		if (text.length > 100)
			return text.substr(0, 99) + '&hellip;';
		else
			return text;
	}
});
