// Shows an individual passage in the story editor, for dragging around.

define(['marionette'],

function (Marionette)
{
	var PassageItemView = Marionette.ItemView.extend(
	{
		template: '#templates .passageItemView',
		className: 'passage',

		initialize: function()
		{
			this.model.on('change', this.render, this);
		},

		onRender: function()
		{
			// have to set absolute positioning manually,
			// or draggable() will manually apply absolute for us

			this.$el
			.attr('data-id', this.model.id)
			.css({
				position: 'absolute',
				top: this.model.get('top'),
				left: this.model.get('left')
			})
			.draggable({
				cursor: 'move',
				addClasses: false
			});
		},

		serializeData: function()
		{
			var data = this.model.toJSON();
			data.excerpt = this.model.excerpt();
			return data;
		},

		edit: function()
		{
			$('#passageId').val(this.model.id);
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

			'drag': function (e, ui)
			{
				app.mainRegion.currentView.drawLinks();
			},

			'dragstop': function (e, ui)
			{
				this.model.save({
					top: ui.position.top,	
					left: ui.position.left	
				});
			},

			'click .edit': 'edit',
			'dblclick': 'edit'
		}
	});

	return PassageItemView;
});
