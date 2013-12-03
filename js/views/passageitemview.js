/**
 This handles display of a single passage in a story map
 managed by StoryEditView.

 @class PassageItemView
 @extends Marionette.ItemView
**/

PassageItemView = Marionette.ItemView.extend(
{
	template: '#templates .passageItemView',
	className: 'passage',

	initialize: function (options)
	{
		this.model.on('change', this.render, this);
		this.parentView = options.parentView;

		// we have to bind zoom events manually
		// because they are a custom event, not DOM-related

		this.listenTo(this.parentView, 'zoom', this.positionEl);
	},

	onRender: function()
	{
		// have to set absolute positioning manually,
		// or draggable() will manually apply absolute for us

		this.$el
		.attr('data-id', this.model.id)
		.css({
			position: 'absolute',
		})
		.draggable({
			cursor: 'move',
			addClasses: false,
			containment: 'parent'
		});

		this.positionEl();
	},

	serializeData: function()
	{
		// add the excerpt manually after saving data

		var data = this.model.toJSON();
		data.excerpt = this.model.excerpt();
		return data;
	},

	/**
	 Positions the DOM element for this passage based on its
	 top and left attributes, and taking into account the 
	 parent view's zoom level.

	 @method position
	**/
	
	positionEl: function()
	{
		var zoom = this.parentView.model.get('zoom');

		this.$el.css({
			top: this.model.get('top') * zoom,
			left: this.model.get('left') * zoom
		});

		/**
		 Fired whenever the passage's position changes.

		 @event move
		**/

		this.trigger('move');
	},

	/**
	 Deletes the underlying passage model.

	 @method delete
	**/

	delete: function()
	{
		this.model.destroy();
	},

	/**
	 Begins editing this passage in a modal dialog.

	 @method edit
	**/

	edit: function()
	{
		$('#passageEditModal .passageId').val(this.model.id);
		$('#passageEditModal .passageName').val(this.model.get('name'));
		$('#passageEditModal .passageText').val(this.model.get('text'));
		$('#passageEditModal .savePassage').on('click', { model: this.model }, this.finishEdit);
		$('#passageEditModal').modal('show');
	},

	/**
	 Updates the model after editing it in the modal created by edit().

	 @method finishEdit
	**/
	
	finishEdit: function (e)
	{
		if (e.data.model.save(
		{
			name: $('#passageEditModal .passageName').val(),
			text: $('#passageEditModal .passageText').val()
		}))
		{
			// successful save;

			$('#passageEditModal .alert').remove();
			$('#passageEditModal').modal('hide');	
		}
		else
		{
			// show the error message

			var message = $('#passageEditModal .alert');
			
			if (message.size() == 0)
				message = $('<p class="alert alert-danger">')
				.text(model.validationError)

			$('#passageEditModal textarea').before(message);
			message.hide().fadeIn();
			$('#passageEditModal .passageName').focus();
		};
	},

	/**
	 Performs all operations needed for the end of a drag of the DOM
	 element, including updating the model.

	 @method endDrag
	 @param {Object} event Standard jQuery event object.
	 @param {Object} ui jQuery UI event object.
	**/

	endDrag: function (event, ui)
	{
		var zoom = this.parentView.model.get('zoom');
	
		// set initial position based on the user's drag

		this.model.set({
			top: ui.position.top / zoom,
			left: ui.position.left / zoom	
		});

		// push the passage so it doesn't overlap any other
		
		app.mainRegion.currentView.positionPassage(this.model);	

		// and finally save changes

		this.model.save();
	},

	events:
	{
		'click .delete': 'delete',
		'dragstop': 'endDrag',
		'click .edit': 'edit',
		'dblclick': 'edit'
	}
});
