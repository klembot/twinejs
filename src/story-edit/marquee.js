/**
 Manages drawing a marquee selection if the user drags in an unoccupied area
 of the story map, and selecting/deselecting

 @class StoryEditView.Marquee
 @extends Backbone.View
**/

'use strict';
const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
		this.$marquee = this.$('.marquee');
	},

	startDrag(e) {

		// only drag if the left button was clicked

		if (e.which !== 1) {
			return;
		}

		// bail out if the target is a .passage element

		if ($(e.target).closest('.passage').length > 0) {
			return;
		}

		this.startX = e.pageX;
		this.startY = e.pageY;

		this.offset = this.$el.offset();
		this.inclusive = e.shiftKey || e.ctrlKey;

		// cache all passage positions so we can
		// quickly figure out intersections

		// dimensions of a passage

		const width = this.$('.passage:first .frame').outerWidth();
		const height = this.$('.passage:first .frame').outerHeight();

		this.cache = [];

		this.parent.children.each(function(view) {
			const offset = view.$('.frame').offset();

			this.cache.push({
				view,
				left: offset.left,
				top: offset.top,
				right: offset.left + width,
				bottom: offset.top + height,
				originallySelected: view.selected
			});

			if (!this.inclusive) {
				view.deselect();
			}
		}, this);

		$('#storyEditView').addClass('marqueeing');

		$('body').on({
			'mousemove.marquee': this.followDrag.bind(this),
			'mouseup.marquee': this.endDrag.bind(this)
		});
	},

	followDrag(e) {
		// marquee appearance

		let left, top, width, height;

		if (e.pageX > this.startX) {
			left = this.startX;
			width = e.pageX - this.startX;
		}
		else {
			left = e.pageX;
			width = this.startX - e.pageX;
		}

		if (e.pageY > this.startY) {
			top = this.startY;
			height = e.pageY - this.startY;
		}
		else {
			top = e.pageY;
			height = this.startY - e.pageY;
		}

		this.$marquee.css({
			display: 'block',
			left: left - this.offset.left,
			top: top - this.offset.top,
			width,
			height
		});

		// select passages

		_.each(this.cache, function(item) {
			if (this.inclusive && item.originallySelected) {
				return;
			}

			// intersection of two rectangles

			if (item.left < left + width && item.right > left &&
				item.top < top + height && item.bottom > top) {
				item.view.select();
			}
			else {
				item.view.deselect();
			}
		}, this);
	},

	endDrag() {
		this.$marquee.css('display', 'none');
		$('#storyEditView').removeClass('marqueeing');
		$('body').off('.marquee');
	},

	events: {
		'mousedown': 'startDrag'
	}
});
