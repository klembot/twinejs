// A passage belongs to a story.

Passage = Backbone.Model.extend({
	defaults:
	{
		story: -1,
		top: 0,
		left: 0,
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

	publish: function()
	{
		return '<section data-name="' + this.get('name') + '" ' +
			   'data-twine-pos="' + this.get('left') + ',' + this.get('top') + '">' +
			   this.get('text') + '</section>';	
	}
});
