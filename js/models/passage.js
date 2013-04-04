// A passage belongs to a story.

Passage = Backbone.Model.extend({
	defaults:
	{
		story: -1,
		title: '',
		text: ''
	}
});
