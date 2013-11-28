// Shows a single story's passages and allows editing.

StoryEditView = Marionette.CompositeView.extend(
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
			placement: 'left',
			container: '#storyEditView',
			content: function() { return $('#storyPropertiesPopover').html() }
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

		this.$('.zoomBig').change(function()
		{
			self.zoomTo('big');
		});

		this.$('.zoomMedium').change(function()
		{
			self.zoomTo('medium');
		});

		this.$('.zoomSmall').change(function()
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
			var model = this.collection.get($('#passageEditModal .passageId').val());

			if (model.save({
				name: $('#passageEditModal .passageName').val(),
				text: $('#passageEditModal .passageText').val()
			}))
			{
				$('#passageEditModal .alert').remove();
				$('#passageEditModal').modal('hide');	
			}
			else
			{
				var message = $('#passageEditModal .alert');
				
				if (message.size() == 0)
					message = $('<p class="alert alert-danger">')
					.text(model.validationError)

				$('#passageEditModal textarea').before(message);
				message.hide().fadeIn();
				$('#passageEditModal .passageName').focus();
			};
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
			console.log('editing stylesheet');
			this.$('#stylesheetModal .stylesheetSource').val(this.model.get('stylesheet'));
			this.$('.storyProperties').popover('hide');
			this.$('#stylesheetModal').modal('show');	
		},

		'click .saveStylesheet': function()
		{
			this.model.save({ stylesheet: this.$('#stylesheetModal .stylesheetSource').val() });
			this.$('#stylesheetModal').modal('hide');	
		},

		'click .editScript': function()
		{
			this.$('.scriptSource').val(this.model.get('script'));
			this.$('.storyProperties').popover('hide');
			this.$('#scriptModal').modal('show');	
		},

		'click .saveScript': function()
		{
			this.model.save({ script: this.$('.scriptSource').val() });
			this.$('#scriptModal').modal('hide');	
		},

		// keeps track of passages as they are dragged

		'drag .passage': function (event)
		{
			this.cachePassage(this.collection.get($(event.target).closest('.passage').attr('data-id')));
			this.drawLinks();
		}
	},

    lineLength: function (line)
	{
        return Math.sqrt(Math.pow(line[1].x - line[0].x, 2) +
                         Math.pow(line[1].y - line[0].y, 2));
    },

    endPointProjectedFrom: function (line, angle, distance)
    {
        var length = this.lineLength(line);

        if (length == 0)
			return line[1];

        // taken from http://mathforum.org/library/drmath/view/54146.html

        var lengthRatio = distance / length;

        var x = line[1].x - ((line[1].x - line[0].x) * Math.cos(angle) -
                             (line[1].y - line[0].y) * Math.sin(angle)) * lengthRatio;
        var y = line[1].y - ((line[1].y - line[0].y) * Math.cos(angle) +
                             (line[1].x - line[0].x) * Math.sin(angle)) * lengthRatio;

        return {x: x, y: y};
    },

    arrowMinLength: 5,
    arrowAngle: Math.PI/6,

	drawLinks: function()
	{
		var canvas = this.$('canvas')[0];
		var gc = canvas.getContext('2d');
		var passages = {};
		var passageNames = [];
		var width = this.$('.passage:first .frame').outerWidth();
		var height = this.$('.passage:first .frame').outerHeight();
        var arrowSize = Math.max(width / 8);

		// draw connections

		canvas.width = canvas.width;

		for (var name in this.drawCache)
        {
			if (this.drawCache.hasOwnProperty(name))
  		    {
			    var p = this.drawCache[name];

				for (var i = 0; i < p.links.length; i++)
                {
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

                                var line = [{ x: p.position.left + width, y: p.position.top + height / 2 },
                                            { x: q.position.left, y: q.position.top + height / 2 }];
							}
						    else
						    {
							    // left side of p to right side of q

                                var line = [{x: p.position.left, y: p.position.top + height / 2 },
                                            {x: q.position.left + width, y: q.position.top + height / 2 }];
							};
						}
						else
						{
							// connect vertical sides
							if (yDist > 0)
							{
								// bottom side of p to top side of q

                                var line = [{x: p.position.left + width / 2, y: p.position.top + height },
                                            {x: q.position.left + width / 2, y: q.position.top }];
							}
						    else
						    {
							    // top side of p to top side of q

                                var line = [{ x: p.position.left + width / 2, y: p.position.top },
                                            { x: q.position.left + width / 2, y: q.position.top + height }];
						    };
						};

                        var arrow =
						[
                            this.endPointProjectedFrom(line, this.arrowAngle, arrowSize),
                            this.endPointProjectedFrom(line, -this.arrowAngle, arrowSize)
                        ];

		                gc.moveTo(line[0].x, line[0].y);
 		                gc.lineTo(line[1].x, line[1].y);

                        gc.moveTo(line[1].x, line[1].y);
		                gc.lineTo(arrow[0].x, arrow[0].y);
                        gc.moveTo(line[1].x, line[1].y);
    		            gc.lineTo(arrow[1].x, arrow[1].y);

                        gc.closePath();
				    };

			        gc.lineWidth = 2;
 			        gc.strokeStyle = '#7088ac';
			        gc.fillStyle = '#7088ac';
			        gc.stroke();
				};
            };
        };
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

	    // change appearance

	    this.$el.removeClass('zoom-small zoom-medium zoom-big').addClass('zoom-' + scale);
	    this.children.each(function (view)
		                   {
			                   view.trigger('zoom');
		                   });

	    this.drawLinks();
    },

	positionPassage: function (passage)
	{
		this.collection.each(function (p)
		{
			if (p.id != passage.id && p.intersects(passage))
			{
				done = false;
				p.displace(passage);
			};
		});
	},

    cachePassage: function (item)
    {
		var pos = this.$('.passages div[data-id="' + item.id + '"] .frame').offset();

	    // if the passage hasn't been rendered yet, there's nothing to cache yet

	    if (pos)
		    this.drawCache[item.get('name')] =
		    {
			    position: pos,
			    links: item.links()
		    };
    }
});
