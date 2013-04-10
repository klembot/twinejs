// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.id }));
		var self = this;

		// keep story name in sync

		this.model.on('change:name', function (model)
		{
			self.$('.nav .storyName').text(model.get('name'));
		});

		// keep start passage menu in sync

		this.collection.on('change:name', function (item)
		{
			self.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.id)
					$(this).text(item.get('name'));
			});
		});

		this.collection.on('add', function (item)
		{
			self.$('select.startPassage').append($('<option value="' + item.id + '">' + item.get('name') + '</option>'));
		});

		this.collection.on('remove', function (item)
		{
			self.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.id)
					$(this).remove();
			});
		});
	},

	onRender: function()
	{
		var self = this;

		this.canvas = this.$('.passages canvas');

		this.$('a[title], button[title]').tooltip();

		// we use #storyPropertiesDialog as a template, but set the values
		// according to the model whenever the popover is shown.

		this.$('.storyProperties')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#storyPropertiesDialog').html() }
		})
		.click(function()
		{
			$('.popover input.storyName').val(self.model.get('name'));			
		});

		// build the initial start passage menu

		var menu = this.$('#startPassage');

		this.collection.each(function (item)
		{
			menu.append($('<option value="' + item.id + '">' + item.get('name') + '</option>'));
		});

		self.drawLinks();
		window.setTimeout(function() { self.drawLinks() }, 0);
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ story: this.model.id });
		},
		
		'click .savePassage': function()
		{
			var model = this.collection.get($('#passageId').val());
			model.save({
				name: $('#passageName').val(),
				text: $('#passageText').val()
			});

			$('#passageEditDialog').modal('hide');
		},

		'change #startPassage': function()
		{
			this.model.save({ startPassage: this.$('#startPassage').val() });
		},

		'change #storyName': function()
		{
			this.model.save({ name: this.$('#storyName').val() });
		},

		'click .playStory': function()
		{
			window.open('#stories/' + this.model.id + '/play', 'twinestory_' + this.model.id);
		}
	},

	drawLinks: function()
	{
		var container = this.$('.passages');
		var canvas = this.$('canvas:first');
		var gc = canvas[0].getContext('2d');
		var passages = {};
		var passageNames = [];
		var offsetX = this.$('.passage:first').width() / 2;
		var offsetY = this.$('.passage:first').height() / 2;

		// this can be memoized

		this.collection.each(function (item)
		{
			var name = item.get('name');

			passageNames.push(name);

			passages[name] =
			{
				position: container.children('div[data-id="' + item.id + '"]:first').position(),
				links: item.links(),
			};
		});

		// reset the size of the canvas

		container.css({
			width: $(window).width(),
			height: $(window).height()
		});
		canvas.width = $(window).width();
		canvas.height = $(window).height();
		canvas.attr({
			width: canvas.width,
			height: canvas.height
		});

		// draw connections

		for (var i = 0; i < passageNames.length; i++)
		{
			var p = passages[passageNames[i]];

			for (var j = 0; j < p.links.length; j++)
			{
				if (passages[p.links[j]])
				{
					var q = passages[p.links[j]];
					gc.moveTo(p.position.left + offsetX, p.position.top + offsetY);
					gc.lineTo(q.position.left + offsetX, q.position.top + offsetY);
				};
			};
		};

		gc.lineWidth = 2;
		gc.strokeStyle = '#7088ac';
		gc.stroke();
	}
});
