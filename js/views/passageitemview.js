// Shows an individual passage in the story editor, for dragging around.

PassageItemView = Marionette.ItemView.extend({
	template: '#templates .passageItemView',

	initialize: function()
	{
		this.model.on('change', this.render, this);
	},

	serializeData: function()
	{
		var data = this.model.toJSON();
		data.excerpt = this.model.excerpt();
		return data;
	},

	edit: function()
	{
		$('#passageId').val(this.model.cid);
		$('#passageName').val(this.model.get('name'));
		$('#passageText').val(this.model.get('text'));
		$('#passageEditDialog').modal('show');	
	},

	events:
	{
		'click .delete': function()
		{
			this.model.destroy();
		},

		'click .edit': 'edit',
		'dblclick': 'edit'
	}
});
