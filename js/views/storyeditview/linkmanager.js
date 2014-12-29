/**
 Manages drawing the arrows connecting linked passages, and re-renders passages
 to keep their broken link status current.

 @class StoryEditView.LinkManager
 @extends Backbone.View
**/

'use strict';

StoryEditView.LinkManager = Backbone.View.extend(
{
	/**
	 Color used to draw links.

	 @property {String} linkColor
	**/

	linkColor: '#7088ac',

	/**
	 Angle at which arrowheads are drawn, in radians.
	 
	 @property {Number} ARROW_ANGLE
	 @final
	**/

	ARROW_ANGLE: Math.PI / 6,

	/**
	 Length of arrowheads, in pixels.

	 @property {Number} ARROW_SIZE
	 @final
	**/
	
	ARROW_SIZE: 10,

	initialize: function (options)
	{
		/**
		 The parent view.

		 @property {StoryEditView} parent
		**/

		this.parent = options.parent;

		/**
		 The SVG element we draw to.

		 @property svg
		**/

		this.svg = SVG(this.parent.$('.passages')[0]);

		/**
		 Tracks passage positions and links to speed up drawing operations.
		 Call cachePassage() to update a passage in the cache.

		 @property {Object} drawCache
		**/

		this.drawCache = {};

		// keep draw cache in sync with collection changes

		this.listenTo(this.parent.collection, 'change:name', function (item)
		{
			delete this.drawCache[item.previous('name')];
			// caching the new version is handled below
		})
		.listenTo(this.parent.collection, 'change', function (item)
		{
			this.cachePassage(item);

			// any passage that links or linked to this one
			// needs to be re-rendered

			var oldName = item.previous('name');
			var newName = item.get('name');

			this.parent.collection.each(function (item)
			{
				_.some(item.links(), function (link)
				{
					if (link == oldName || link == newName)
					{
						this.parent.children.findByModel(item).render();
						return true;
					};
				}, this);
			}, this);

			this.drawLinks();
		})
		.listenTo(this.parent.collection, 'add', function (item)
		{
			this.cachePassage(item);
			this.drawLinks();
		})
		.listenTo(this.parent.collection, 'remove', function (item)
		{
			var name = item.get('name');

			delete this.drawCache[name];
			this.drawLinks();

			// any passage that links or linked to this one
			// needs to be re-rendered

			this.parent.collection.each(function (item)
			{
				_.some(item.links(), function (link)
				{
					if (link == name)
					{
						this.parent.children.findByModel(item).render();
						return true;
					};
				}, this);
			}, this);
		})
		.listenTo(this.parent.model, 'change:zoom', this.reset);

		/**
		 A bound event listener for the start of a passage drag event, so we can later disconnect it.

		 @property {Function} prepDragBound
		 @private
		**/

		this.prepDragBound = _.bind(this.prepDrag, this);
		$('body').on('passagedragstart', this.prepDragBound);

		/**
		 A bound event listener for a passage drag event, so we can later disconnect it.

		 @property {Function} followDragBound
		 @private
		**/

		this.followDragBound = _.bind(this.followDrag, this);
		$('body').on('passagedrag', this.followDragBound);

		// for some reason, jQuery can't see the position of the passages yet, so we defer

		_.defer(_.bind(this.reset, this));
	},

	/**
	 Does cleanup of stuff set up in onRender().

	 @method close
	 @private
	**/

	close: function()
	{
		$('body').off('passagedragstart', this.prepDragBound);
		$('body').off('passagedrag', this.followDragBound);
	},

	/**
	 Forces a re-cache of all passages.

	 @method reset
	**/

	reset: function()
	{
		this.drawCache = {};
		this.parent.collection.each(function(item) { this.cachePassage(item); }, this);
		this.drawLinks();
	},

	/**
	 Projects a point from the endpoint of a line at a certain angle and distance.
	 
	 @method endPointProjectedFrom
	 @param {Array} line An array of two points, each an array in [x, y] format
	 @param {Number} angle Angle in radians to project from the endpoints
	 @param {Number} distance Distance the projected line should have
	 @return Array
	**/

    endPointProjectedFrom: function (line, angle, distance)
    {
        var length = Math.sqrt(Math.pow(line[1][0] - line[0][0], 2) +
                               Math.pow(line[1][1] - line[0][1], 2));

        if (length == 0)
			return line[1];

        // taken from http://mathforum.org/library/drmath/view/54146.html

        var lengthRatio = distance / length;

        var x = line[1][0] - ((line[1][0] - line[0][0]) * Math.cos(angle) -
                             (line[1][1] - line[0][1]) * Math.sin(angle)) * lengthRatio;
        var y = line[1][1] - ((line[1][1] - line[0][1]) * Math.cos(angle) +
                             (line[1][0] - line[0][0]) * Math.sin(angle)) * lengthRatio;

        return [x, y];
    },

	/**
	 Draws arrows between passages to indicate links, using the <canvas> element of this view.

	 @method drawLinks
	**/

	drawLinks: function()
	{
		var drawArrows = (this.parent.model.get('zoom') > 0.25);
		this.svg.clear();

		for (var name in this.drawCache)
		{
			if (! this.drawCache.hasOwnProperty(name))
				continue;

			var p = this.drawCache[name];

			for (var i = 0; i < p.links.length; i++)
			{
				if (! this.drawCache[p.links[i]])
					continue;
				
				var q = this.drawCache[p.links[i]];

				// p is the start passage; q is the destination
				// find the closest sides to connect

				var xDist = q.top[0] - p.top[0];
				var yDist = q.top[1] - p.top[1];
				var line;
				
				if (Math.abs(xDist) > Math.abs(yDist))
				{
					// connect horizontal sides

					if (xDist > 0)
						line = [p.right, q.left];
					else
						line = [p.left, q.right];
				}
				else
				{
					// connect vertical sides

					if (yDist > 0)
						line = [p.bottom, q.top];
					else
						line = [p.top, q.bottom];
				}

				// line is now an array of two points: 0 is the start, 1 is the end
				// add arrowheads as needed

				if (drawArrows)
				{
					var head1 = this.endPointProjectedFrom(line, this.ARROW_ANGLE, this.ARROW_SIZE);
					var head2 = this.endPointProjectedFrom(line, -this.ARROW_ANGLE, this.ARROW_SIZE);
					line.push(head1, [line[1][0], line[1][1]], head2);
				}

				this.svg.polyline(line);
			};
		};
    },

	/**
	 Prepares for the user dragging passages around by remembering
	 which ones are selected, so we don't have to keep asking during the drag.

	 @method prepDrag
	 @internal
	**/

	prepDrag: function()
	{
		/**
		 An array of PassageItemViews currently being dragged.

		 @property draggedPassages
		 @private
		**/

		this.draggedPassages = this.parent.children.filter(function (view)
		{
			return view.selected;	
		});
	},

	/**
	 Re-caches dragged passages in flight and redraws links.

	 @method followDrag
	 @internal
	**/

	followDrag: function()
	{
		_.each(this.draggedPassages, function (view)
		{
			this.cachePassage(view.model);
		}, this);

		this.drawLinks();
	},

	/**
	 Updates the draw cache for a passage. This must occur whenever a passage's position,
	 name, or text changes. All of these can affect links drawn. This uses the passage's
	 position onscreen instead of its model's position, since we need to draw links as
	 the passage is dragged around onscreen, i.e. before any changes are saved to the model.

	 @method cachePassage
	 @param {Passage} passage Passage to cache.
	**/

    cachePassage: function (passage)
    {
		var offset = this.$('.passages').offset();
		var passEl = this.$('.passages div[data-id="' + passage.id + '"] .frame');
		var pos = this.$('.passages div[data-id="' + passage.id + '"] .frame').offset();
		var width = passEl.width();
		var height = passEl.height();

	    // if the passage hasn't been rendered yet, there's nothing to cache yet

	    if (pos)
		{
			var x = pos.left - offset.left;
			var y = pos.top - offset.top;

		    this.drawCache[passage.get('name')] =
		    {
				top: [x + width / 2, y],
				right: [x + width, y + height / 2],
				bottom: [x + width / 2, y + height],
				left: [x, y + height / 2],
			    links: passage.links()
		    };
		};
    }
});
