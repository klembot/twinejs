/**
 A single node in a story.
 
 @class Passage
 @extends Backbone.Model
**/

Passage = Backbone.Model.extend(
{
	/**
	 The largest width a passage will have onscreen, in pixels.
	 This is used by intersects() and displace().
	 @property {Number} width
	**/ 
	
	width: 100,

	/**
	 The largest height a passage will have onscreen, in pixels.
	 This is used by intersects() and displace().
	 @property {Number} height
	**/ 
	height: 100,

	defaults:
	{
		story: -1,
		top: 0,
		left: 0,
		name: 'Untitled Passage',
		text: 'Double-click this passage to edit it.'
	},

	template: _.template('<script data-role="passage" data-id="<%- id %>" data-name="<%- name %>" ' +
						 'type="text/twine" data-twine-position="<%- left %>,<%- top %>">' +
						 '<%- text %></script>'),

	initialize: function()
	{
		var self = this;

		this.on('sync', function()
		{
			window.app.stories.fetch(
			{
				success: function (stories)
				{
					// if any stories are using this passage's cid
					// as their start passage, update with a real id

					var starters = stories.where({ startPassage: self.cid });

					for (var i = 0; i < starters.length; i++)
						starters[i].save({ startPassage: self.id });

					// update parent's last update date

					var parent = stories.where({ id: self.get('story') })[0];
					parent.save('lastUpdate', new Date());
				}
			});
		});
	},

	validate: function (attrs)
	{
		if (! attrs.name || attrs.name == '')
			return Passage.NO_NAME_ERROR;

		var dupe;
		var story = this.get('story');

		window.app.passages.fetch(
		{
			success: function()
			{
				dupe = _.find(window.app.passages.where({ story: story }),
				function (passage)
				{
					return (attrs.id != passage.id &&
							attrs.name.toLowerCase() == passage.get('name').toLowerCase());
				});
			}
		});

		if (dupe)
			return Passage.DUPE_NAME_ERROR.replace('%s', attrs.name);
	},

	/**
	 Returns a short excerpt of this passage's text, truncating with
	 ellipses if needed.

	 @method excerpt
	 @return {String} Excerpt.
	**/

	excerpt: function()
	{
		var text = this.get('text');

		if (text.length > 100)
			return text.substr(0, 99) + '&hellip;';
		else
			return text;
	},

	/**
	 Returns an array of all passage names that are linked from this one.

	 @method links
	 @return {Array} Array of string names.
	**/

	links: function()
	{
		var matches = this.get('text').match(/\[\[.*?\]\]/g);
		var result = [];

		if (matches)
			for (var i = 0; i < matches.length; i++)
				result.push(matches[i].replace(/[\[\]]/g, '').replace(/\|.*/, ''));

		return result;
	},

	/**
	 Publishes the passage to an HTML fragment.

	 @method publish
	**/

	publish: function (id)
	{
		return this.template(
		{
			id: id,
			name: this.get('name'),
			left: this.get('left'),
			top: this.get('top'),
			text: this.get('text')
		});
	},

	/**
	 Checks whether this passage intersects another onscreen.

	 @method intersects
	 @param {Passage} other Other passage to check.
	 @return {Boolean} Whether there is an intersection.
	**/

	intersects: function (other)
	{
		return (this.get('left') < other.get('left') + other.width &&
		        this.get('left') + this.width > other.get('left') &&
		        this.get('top') < other.get('top') + other.height &&
				this.get('top') + this.height > other.get('top'));
	},

	/**
	 Moves another passage so that it no longer intersects this one.
	 This moves the passage along either the X or Y axis only --
	 whichever direction will cause the passage to move the least.

	 @method displace
	 @param {Passage} other Other passage to displace.
	**/

	displace: function (other)
	{
		var tLeft = this.get('left');
		var tRight = tLeft + this.width;
		var tTop = this.get('top');
		var tBottom = tTop + this.height;
		var oLeft = other.get('left');
		var oRight = oLeft + other.width;
		var oTop = other.get('top');
		var oBottom = oTop + other.height;

		// calculate overlap amounts
		// this is cribbed from
		// http://frey.co.nz/old/2007/11/area-of-two-rectangles-algorithm/

		var xOverlap = Math.min(tRight, oRight) - Math.max(tLeft, oLeft);
		var yOverlap = Math.min(tBottom, oBottom) - Math.max(tTop, oTop);

		// resolve horizontal overlap

		var xChange, yChange;

		if (xOverlap != 0)
		{
			var leftMove = (oLeft - tLeft) + other.width;
			var rightMove = tRight - oLeft;
			
			if (leftMove < rightMove)
				xChange = - leftMove
			else
				xChange = rightMove;
		};
		
		// resolve vertical overlap

		if (yOverlap != 0)
		{
			var upMove = (oTop - tTop) + other.height;
			var downMove = tBottom - oTop;
			
			if (upMove < downMove)
				yChange = - upMove;
			else
				yChange = downMove;
		};
		
		// choose the option that moves the other passage the least

		if (Math.abs(xChange) > Math.abs(yChange))
			other.set('top', oTop + yChange);
		else
			other.set('left', oLeft + xChange);
	}
},
{
	/**
	 Error message for when a passage has no name, or an empty string
	 for a name.

	 @property {String} NO_NAME_ERROR
	 @static
	 @final
	**/
	NO_NAME_ERROR: 'You must give this passage a name.',

	/**
	 Error message for when a passage with the same name is created.
	 %s is a placeholder for the passage's name.

	 @property {String} DUPE_NAME_ERROR
	 @static
	 @final
	**/
	DUPE_NAME_ERROR: 'There is already a passage named "%s." Please give this one a unique name.'
});
