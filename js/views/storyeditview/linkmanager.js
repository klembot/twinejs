/**
 Manages drawing the arrows connecting linked passages, and re-renders passages
 to keep their broken link status current.

 @class StoryEditView.LinkManager
 @extends Backbone.View
**/

StoryEditView.LinkManager = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;

		/**
		 Tracks passage positions and links to speed up drawing operations.
		 Call cachePassage() to update a passage in the cache.

		 @property {Object} drawCache
		**/

		this.drawCache = {};

		/**
		 Color used to draw links.

		 @property {String} linkColor
		**/

		this.linkColor = '#7088ac';

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

		// as the window resizes, we need to redraw links because our canvas element is changing size

		$(window).on('resize', _.debounce(_.bind(this.drawLinks, this), 500));

		// for some reason, jQuery can't see the position of the passages yet, so we defer

		_.defer(_.bind(this.reset, this));
	},

	/**
	 Forces a re-cache of all passages.

	 @method reset
	**/

	reset: function()
	{
		this.drawCache = {};
		this.parent.collection.each(function(item) { this.cachePassage(item) }, this);
		this.drawLinks();
	},

	/**
	 Projects a point from the endpoint of a line at a certain angle and distance.
	 
	 @method endPointProjectedFrom
	 @param {Array} line An array of two points, each an object with x and y properties
	 @param {Number} angle Angle in radians to project from the endpoints
	 @param {Number} distance Distance the projected line should have
	**/

    endPointProjectedFrom: function (line, angle, distance)
    {
        var length = Math.sqrt(Math.pow(line[1].x - line[0].x, 2) +
                               Math.pow(line[1].y - line[0].y, 2));

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

	/**
	 Draws arrows between passages to indicate links, using the <canvas> element of this view.

	 @method drawLinks
	**/

	drawLinks: function()
	{
		// canvas properties

		var canvas = this.$('canvas')[0];
		var gc = canvas.getContext('2d');

		// dimensions of a passage

		var width = this.$('.passage:first .frame').outerWidth();
		var height = this.$('.passage:first .frame').outerHeight();

		// configuration of arrowheads
		
		var drawArrows = (this.parent.model.get('zoom') > 0.25);
        var arrowSize = Math.max(width / 8);
		var arrowAngle = Math.PI / 6;

		gc.beginPath();
		gc.clearRect(0, 0, canvas.width, canvas.height);
		gc.strokeStyle = this.linkColor;
		gc.fillStyle = this.linkColor;
		gc.lineWidth = 2;

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
				}

				// line is now an array of two points: 0 is the start, 1 is the end

				var arrow;

				if (drawArrows)
					arrow =
					[
						this.endPointProjectedFrom(line, arrowAngle, arrowSize),
						this.endPointProjectedFrom(line, -arrowAngle, arrowSize)
					];

				// draw it

				gc.moveTo(line[0].x, line[0].y);
				gc.lineTo(line[1].x, line[1].y);

				if (drawArrows)
				{
					gc.moveTo(line[1].x, line[1].y);
					gc.lineTo(arrow[0].x, arrow[0].y);
					gc.moveTo(line[1].x, line[1].y);
					gc.lineTo(arrow[1].x, arrow[1].y);
				};

				gc.closePath();
				gc.stroke();
			};
		};
    },

	/**
	 Updates the draw cache for a passage. This must occur whenever a passage's position,
	 name, or text changes. All of these can affect links drawn.

	 @method cachePassage
	 @param {Passage} passage Passage to cache.
	**/

    cachePassage: function (passage)
    {
		var offset = this.$('.passages').offset();
		var pos = this.$('.passages div[data-id="' + passage.id + '"] .frame').offset();

	    // if the passage hasn't been rendered yet, there's nothing to cache yet

	    if (pos)
		    this.drawCache[passage.get('name')] =
		    {
			    position: { left: pos.left - offset.left, top: pos.top - offset.top },
			    links: passage.links()
		    };
    }
});
