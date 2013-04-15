// Shows a single story's passages and allows editing.

define(['marionette', 'views/passageitemview', 'collections/passagecollection', 'bootstrap', 'jqueryui'],

function (Marionette, PassageItemView, PassageCollection)
{
	var StoryEditView = Marionette.CompositeView.extend(
	{
		itemView: PassageItemView,
		itemViewContainer: '.passages',
		template: '#templates .storyEditView',

		initialize: function (options)
		{
			var self = this;
			this.collection = new PassageCollection(app.passages.where({ story: this.model.id }));

			// this tracks passage positions and links to speed up drawing

			this.drawCache = {};

			// keep story name in sync

			this.model.on('change:name', function (model)
			{
				self.$('.nav .storyName').text(model.get('name'));
			});

			// keep start passage menu and draw cache in sync

			this.collection
			.on('change:name', function (item)
			{
				delete self.drawCache[item.previous('name')];

				self.$('select.startPassage option').each(function()
				{
					if ($(this).val() == item.id)
						$(this).text(item.get('name'));
				});
			})
			.on('change', function (item)
			{
				self.cachePassage(item);
				self.drawLinks();
			})
			.on('add', function (item)
			{
				self.$('select.startPassage').append($('<option value="' + item.id + '">' + item.get('name') + '</option>'));
				self.cachePassage(item);
				self.drawLinks();
			})
			.on('remove', function (item)
			{
				delete self.drawCache[item.get('name')];
				self.drawLinks();

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

			self.resizeCanvas();
			$(window).on('resize', function() { self.resizeCanvas() });

			// for some reason, jQuery can't see the position of the passages yet, so we defer... kind of

			window.setTimeout(function()
			{
				self.collection.each(function(item) { self.cachePassage(item) });
				self.drawLinks();
			}, 0);
		},

		close: function()
		{
			$(window).off('resize');
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
			},

			// keeps track of passages as they are dragged

			'drag .passage': function (event)
			{
				this.cachePassage(this.collection.get($(event.target).closest('.passage').attr('data-id')));
				this.drawLinks();
			}
		},

		drawLinks: function()
		{
			var canvas = this.$('canvas')[0];
			var gc = canvas.getContext('2d');
			var passages = {};
			var passageNames = [];
			var offsetX = this.$('.passage:first').width() / 2;
			var offsetY = this.$('.passage:first').height() / 2;

			// draw connections

			canvas.width = canvas.width;

			for (var name in this.drawCache)
				if (this.drawCache.hasOwnProperty(name))
				{
					var p = this.drawCache[name];

					for (var i = 0; i < p.links.length; i++)
						if (this.drawCache[p.links[i]])
						{
							var q = this.drawCache[p.links[i]];
							gc.moveTo(p.position.left + offsetX, p.position.top + offsetY);
							gc.lineTo(q.position.left + offsetX, q.position.top + offsetY);
						};
				};

			gc.lineWidth = 2;
			gc.strokeStyle = '#7088ac';
			gc.stroke();
		},

		resizeCanvas: function()
		{
			var width = $(document).width();
			var height = $(document).height();

			this.$('.passages').css({
				width: width,
				height: height
			});
			
			this.$('canvas').attr({
				width: width,
				height: height
			});

			this.drawLinks();
		},

		cachePassage: function (item)
		{
			var container = this.$('.passages');

			this.drawCache[item.get('name')] =
			{
				position: container.children('div[data-id="' + item.id + '"]:first').position(),
				links: item.links()
			};
		}
	});

	return StoryEditView;
});
