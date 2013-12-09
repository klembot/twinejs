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

	/**
	 If true, then any change in the model's position
	 properties will be animated instead of immediately
	 changed.

	 @property animateMovement
	 @type Boolean
	**/

	animateMovement: false,

	initialize: function (options)
	{
		this.listenTo(this.model, 'change', this.render);
		this.parentView = options.parentView;
		this.listenTo(this.parentView, 'zoom', this.render);
	},

	onRender: function()
	{
		var zoom = this.parentView.model.get('zoom');

		// have to set absolute positioning manually,
		// or draggable() will manually apply absolute for us

		this.$el
		.attr('data-id', this.model.id)
		.css('position', 'absolute')
		.draggable(
		{
			cursor: 'move',
			addClasses: false,
			containment: 'parent'
		});

		this.$el.animate(
		{
			top: this.model.get('top') * zoom,
			left: this.model.get('left') * zoom
		}, this.animateMovement ? 100 : 0);
	},

	serializeData: function()
	{
		// add the excerpt manually after saving data

		var data = this.model.toJSON();
		data.excerpt = this.model.excerpt();
		return data;
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
			$('#passageEditModal .savePassage').off('click');
			$('#passageEditModal').modal('hide');	
		}
		else
		{
			// show the error message

			var message = $('#passageEditModal .alert');
			
			if (message.size() == 0)
				message = $('<p class="alert alert-danger">')
				.text(e.data.model.validationError)

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

		this.model.set(
		{
			top: ui.position.top / zoom,
			left: ui.position.left / zoom	
		});

		// push the passage so it doesn't overlap any other
		
		this.animateMovement = true;
		this.parentView.positionPassage(this.model);	
		this.animateMovement = false;

		// and finally save changes
		// I don't get it, but we have to specify the attributes manually
		// or this will save our pre-drag position

		this.model.save({ top: this.model.get('top'), left: this.model.get('left') });
	},

	events:
	{
		'click .delete': 'delete',
		'dragstop': 'endDrag',
		'click .edit': 'edit',
		'dblclick': 'edit'
	}
});
