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
		this.parentView = options.parentView;
		this.listenTo(this.model, 'change', this.render)
		.listenTo(this.model, 'change:text', this.createLinkedPassages)
		.listenTo(this.parentView, 'zoom', this.render);
	},

	onRender: function()
	{
		var zoom = this.parentView.model.get('zoom');
		var top = this.model.get('top') * zoom;
		var left = this.model.get('left') * zoom;

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

		// set CSS class for broken links

		var links = this.model.links();
		var broken = false;

		if (_.every(this.model.links(), function (link)
		{
			return this.parentView.collection.findWhere({ name: link });
		}, this))
			this.$el.removeClass('brokenLink');
		else
			this.$el.addClass('brokenLink');

		if (this.animateMovement)
			this.$el.animate({ left: left, top: top }, 100);
		else
			this.$el.css({ left: left, top: top });
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
		var model = this.model;

		this.disappear(function()
		{
			model.destroy();
		});
	},

	/**
	 Begins editing this passage in a modal dialog.

	 @method edit
	**/

	edit: function()
	{
		this.parentView.passageEditor.model = this.model;
		this.parentView.passageEditor.open();
	},

	/**
	 Creates passage models for any broken links that are in this model's
	 text, but are not contained in the previous state's text. This is called
	 automatically whenever the model's text property is changed.

	 @method createLinkedPassages
	**/

	createLinkedPassages: function()
	{
		// derive the previous set of links

		var oldBroken = [];

		if (this.model.previous('text'))
		{
			var currentText = this.model.get('text');
			this.model.set({ text: this.model.previous('text') }, { silent: true })

			oldBroken = _.filter(this.model.links(), function (link)
			{
				return (this.parentView.collection.findWhere({ name: link }) !== null);
			}, this);

			this.model.set({ text: currentText }, { silent: true });
		};

		// we start new passages directly below this one

		var newTop = this.model.get('top') + Passage.height * 1.5;
		var newLeft = this.model.get('left');

		// actually create them

		_.each(this.model.links(), function (link)
		{
			if (! this.parentView.collection.findWhere({ name: link }) &&
				oldBroken.indexOf(link) == -1)
			{
				var passage = new Passage({
					story: this.model.get('story'),
					name: link,
					top: newTop,
					left: newLeft
				});

				this.parentView.collection.add(passage);
				this.parentView.positionPassage(passage);
				passage.save();
				this.parentView.children.findByModel(passage).appear();
				newLeft += Passage.width * 1.5;
			};
		}, this);
	},

	/**
	 Animates the view as if it were apppearing onscreen for the first time.

	 @method appear
	 @param {Function} callback Function to call when the animation is done.
	**/

	appear: function (callback)
	{
		if (callback)
			this.$el.on('animationend webkitAnimationEnd MSAnimationEnd', function()
			{
				callback();
				$(this).off('animationend webkitAnimationEnd MSAnimationEnd');
			});

		this.$el.addClass('fallIn');
	},

	/**
	 Animates the view as if it were disappearing onscreen.

	 @method disappear
	 @param {Function} callback Function to call when the animation is done.
	**/

	disappear: function (callback)
	{
		if (callback)
			this.$el.on('animationend webkitAnimationEnd MSAnimationEnd', function()
			{
				callback();
				$(this).off('animationend webkitAnimationEnd MSAnimationEnd');
			});

		this.$el.removeClass('fallIn').addClass('disappear');
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
