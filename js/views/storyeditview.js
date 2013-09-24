// Shows a single story's passages and allows editing.

define(['marionette', 'views/passageitemview', 'collections/passagecollection', 'bootstrap', 'jqueryui'],

function (Marionette, PassageItemView, PassageCollection)
{
	var StoryEditView = Marionette.CompositeView.extend(
	{
		itemView: PassageItemView,
		itemViewContainer: '.passages',
		itemViewOptions: function() { return { parentView: this } },
		template: '#templates .storyEditView',

		initialize: function (options)
		{
			var self = this;
			this.collection = new PassageCollection(app.passages.where({ story: this.model.id }));

			// this tracks passage positions and links to speed up drawing

			this.drawCache = {};

			// zoom setting; this should eventually be saved with the story

			this.zoom = 1;

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
					if ($(this).val() == item.id || $(this).val() == item.cid)
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
				// set as starting passage if we only have one

				if (self.collection.length == 1)
				{
					self.model.save({ startPassage: item.cid });
				};

				self.$('select.startPassage').append($('<option value="' + (item.id || item.cid) +
				                                     '">' + item.get('name') + '</option>'));
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

			this.on('itemview:move', function (childView)
			{
				this.cachePassage(childView.model);
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

			// zoom button handlers
			// default to big zoom

			self.$el.addClass('zoom-big');

			this.$('.zoomBig').click(function()
			{
				self.zoomTo('big');
			});

			this.$('.zoomMedium').click(function()
			{
				self.zoomTo('medium');
			});

			this.$('.zoomSmall').click(function()
			{
				self.zoomTo('small');
			});

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
			this.$('.zoomBig').off('click');
			this.$('.zoomMedium').off('click');
			this.$('.zoomSmall').off('click');
		},

		events:
		{
			'click .add': function()
			{
				var container = this.$('.passages');
				var offsetX = this.$('.passage:first').width() / 2;
				var offsetY = this.$('.passage:first').height() / 2;

				this.collection.create({
					story: this.model.id,
					top: ($(window).scrollTop() + $(window).height() / 2) - offsetY,
					left: ($(window).scrollLeft() + $(window).width() / 2) - offsetX
				});
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

			'click .publishStory': function()
			{
				window.app.publishStory(this.model);
			},

			'click .editStylesheet': function()
			{
				this.$('#stylesheetSource').val(this.model.get('stylesheet'));
				this.$('.storyProperties').popover('hide');
				this.$('#stylesheetEditDialog').modal('show');	
			},

			'click .saveStylesheet': function()
			{
				this.model.save({ stylesheet: this.$('#stylesheetSource').val() });
				this.$('#stylesheetEditDialog').modal('hide');	
			},

			'click .editScript': function()
			{
				this.$('#scriptSource').val(this.model.get('script'));
				this.$('.storyProperties').popover('hide');
				this.$('#scriptEditDialog').modal('show');	
			},

			'click .saveScript': function()
			{
				this.model.save({ script: this.$('#scriptSource').val() });
				this.$('#scriptEditDialog').modal('hide');	
			},

			// keeps track of passages as they are dragged

			'drag .passage': function (event)
			{
				this.cachePassage(this.collection.get($(event.target).closest('.passage').attr('data-id')));
				this.drawLinks();
			},

		},

		drawLinks: function()
		{
			var canvas = this.$('canvas')[0];
			var gc = canvas.getContext('2d');
			var passages = {};
			var passageNames = [];
			var width = this.$('.passage:first .frame').width();
			var height = this.$('.passage:first .frame').height();

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

							var xDist = q.position.left - p.position.left;
							var yDist = q.position.top - p.position.top;

							if (Math.abs(xDist) > Math.abs(yDist))
							{
								// connect horizontal sides

								if (xDist > 0)
								{
									// right side of p to left side of q

									gc.moveTo(p.position.left + width, p.position.top + height / 2);
									gc.lineTo(q.position.left, q.position.top + height / 2);
								}
								else
								{
									// left side of p to right side of q

									gc.moveTo(p.position.left, p.position.top + height / 2);
									gc.lineTo(q.position.left + width, q.position.top + height / 2);
								};
							}
							else
							{
								// connect vertical sides

								if (yDist > 0)
								{
									// bottom side of p to top side of q

									gc.moveTo(p.position.left + width / 2, p.position.top + height);
									gc.lineTo(q.position.left + width / 2, q.position.top);
								}
								else
								{
									// top side of p to top side of q

									gc.moveTo(p.position.left + width / 2, p.position.top);
									gc.lineTo(q.position.left + width / 2, q.position.top + height);
								};
							};
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

		zoomTo: function (scale)
		{
			var self = this;

			switch (scale)
			{
				case 'small':
				this.zoom = 0.25;
				break;

				case 'medium':
				this.zoom = 0.5;
				break;

				case 'big':
				this.zoom = 1;
				break;

				default:
				throw new Error("Unknown zoom scale: " + scale);
			};

			this.$el.removeClass('zoom-small zoom-medium zoom-big').addClass('zoom-' + scale);
			this.children.each(function (view)
			{
				view.trigger('zoom');
			});

			this.drawLinks();
		},

		cachePassage: function (item)
		{
			var pos = this.$('.passages').children('div[data-id="' + item.id + '"]:first').position();

			// if the passage hasn't been rendered yet, there's nothing to cache yet

			if (pos)
				this.drawCache[item.get('name')] =
				{
					position: pos,
					links: item.links()
				};
		}
	});

	return StoryEditView;
});
