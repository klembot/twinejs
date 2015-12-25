/**
 Manages drawing a marquee selection if the user drags in an unoccupied area
 of the story map, and selecting/deselecting

 @class StoryEditView.Marquee
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.$el = $('<div class="marquee"></div>');
		this.parent.$('.passages').append(this.$el);
		this.followDragBound = this.followDrag.bind(this);
		this.endDragBound = this.endDrag.bind(this);
	},

	startDrag: function (e)
	{
		// bail out if the target is a passage

		if ($(e.target).closest('.passage').length > 0)
			return;

		this.startX = e.pageX;
		this.startY = e.pageY;

		this.inclusive = e.shiftKey || e.ctrlKey;

		// cache all passage positions so we can
		// quickly figure out intersections

		this.cache = [];

		this.parent.children.each(function (view)
		{
			this.cache.push(
			{
				view: view,
				rect: view.domRect(),
				originallySelected: view.selected
			});

			if (! this.inclusive)
				view.deselect();
		}, this);

		this.parent.$el.addClass('marqueeing');

		$('body').on(
		{
			mousemove: this.followDragBound,
			mouseup: this.endDragBound
		});
	},

	followDrag: function (e)
	{
		// marquee appearance

		var marqLeft, marqTop, marqRight, marqBottom;

		if (e.pageX > this.startX)
		{
			marqLeft = this.startX;
			marqRight = e.pageX;
		}
		else
		{
			marqLeft = e.pageX;
			marqRight = this.startX;
		};

		if (e.pageY > this.startY)
		{
			marqTop = this.startY;
			marqBottom = e.pageY;
		}
		else
		{
			marqTop = e.pageY;
			marqBottom = this.startY;
		};

		this.$el.css(
		{
			display: 'block',
			left: marqLeft,
			top: marqTop,
			width: marqRight - marqLeft,
			height: marqBottom - marqTop
		});

		// select passages

		_.each(this.cache, function checkIntersection (item)
		{
			if (this.inclusive && item.originallySelected)
				return;

			// intersection of two rectangles

			if (item.rect.left < marqRight && item.rect.right > marqLeft
				&& item.rect.top < marqBottom && item.rect.bottom > marqTop)
				item.view.select();
			else
				item.view.deselect();
		}, this);
	},

	endDrag: function()
	{
		this.$el.css('display', 'none');
		this.parent.$el.removeClass('marqueeing');
		$('body').off(
		{
			mousemove: this.followDragBound,
			mouseup: this.endDragBound
		});
	},

	events:
	{
		'mousedown': 'startDrag'
	}
});
