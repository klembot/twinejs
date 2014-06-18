/**
 A single node in a story.

 @class Passage
 @extends Backbone.Model
**/

Passage = Backbone.Model.extend(
{

	defaults:
	{
		story: -1,
		top: 0,
		left: 0,
		name: 'Untitled Passage',
		text: 'Double-click this passage to edit it.',
		tags: []
	},

	template: _.template('<tw-passagedata pid="<%- id %>" name="<%- name %>" ' +
						 'tags="<%- tags %>" position="<%- left %>,<%- top %>">' +
						 '<%- text %></tw-passagedata>'),

	initialize: function()
	{
		this.on('sync', function()
		{
			// if any stories are using this passage's cid
			// as their start passage, update with a real id

			_.invoke(StoryCollection.all().where({ startPassage: self.cid }), 'save', { startPassage: this.id });
		}, this);

		this.on('change', function()
		{
			// update parent's last update date

			this.fetchStory().set('lastUpdate', new Date());
		}, this);
	},

	/**
	 Fetches this passage's parent story. Beware: this model represents the
	 state of the story at the time of the call, and will not reflect future changes.
	 If the story does not exist, this returns null.

	 @method fetchStory
	 @return {Story} Story model
	**/

	fetchStory: function()
	{
		return StoryCollection.all().find(function (s)
		{
			return s.id == this.get('story') || s.cid == this.get('story');
		}, this);
	},

	validate: function (attrs)
	{
		if (! attrs.name || attrs.name == '')
			return Passage.NO_NAME_ERROR;

		if (this.fetchStory().fetchPassages().find(function (passage)
		    {
				return (attrs.id != passage.id &&
						attrs.name.toLowerCase() == passage.get('name').toLowerCase());
		    }))
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
		var text = _.escape(this.get('text'));

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
			{
				/*
					Arrow links
					[[display text->link]] format
					[[link<-display text]] format
					This regex will interpret the rightmost '->' and the leftmost '<-' as the divider.
				*/
				result.push(matches[i].replace(/\[\[(?:([^\]]*)\->|([^\]]*?)<\-)([^\]]*)\]\]/g, function(a,b,c,d) {
					return c ? c : d;
				})
				/*
					TiddlyWiki links
					[[display text|link]] format
				*/
					.replace(/\[\[([^\|\]]*?)\|([^\|\]]*)?\]\]/g, "$2")
				/*
					[[link]] format
				*/
					.replace(/\[\[|\]\]/g,""));
			}

		return result;
	},

	/**
	 Publishes the passage to an HTML fragment.

	 @method publish
	 @param {Number} id numeric id to assign to the passage, *not* this one's DB id
	 @return {String} HTML fragment
	**/

	publish: function (id)
	{
		var tags = this.get('tags');

		return this.template(
		{
			id: id,
			name: this.get('name'),
			left: this.get('left'),
			top: this.get('top'),
			text: this.get('text'),
			tags: tags ? this.get('tags').join(' ') : ''
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
		var pP = Passage.padding;
		var pW = Passage.width;
		var pH = Passage.height;

		return (this.get('left') - pP < other.get('left') + pW + pP &&
		        this.get('left') + pW + pP > other.get('left') - pP &&
		        this.get('top') - pP < other.get('top') + pH + pP &&
				this.get('top') + pH + pP > other.get('top') - pP);
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
		var p = Passage.padding;
		var tLeft = this.get('left') - p;
		var tRight = tLeft + Passage.width + p * 2;
		var tTop = this.get('top') - p;
		var tBottom = tTop + Passage.height + p * 2;
		var oLeft = other.get('left') - p;
		var oRight = oLeft + Passage.width + p * 2;
		var oTop = other.get('top') - p;
		var oBottom = oTop + Passage.height + p * 2;

		// calculate overlap amounts
		// this is cribbed from
		// http://frey.co.nz/old/2007/11/area-of-two-rectangles-algorithm/

		var xOverlap = Math.min(tRight, oRight) - Math.max(tLeft, oLeft);
		var yOverlap = Math.min(tBottom, oBottom) - Math.max(tTop, oTop);

		// resolve horizontal overlap

		var xChange, yChange;

		if (xOverlap != 0)
		{
			var leftMove = (oLeft - tLeft) + Passage.width + p;
			var rightMove = tRight - oLeft + p;

			if (leftMove < rightMove)
				xChange = - leftMove
			else
				xChange = rightMove;
		};

		// resolve vertical overlap

		if (yOverlap != 0)
		{
			var upMove = (oTop - tTop) + Passage.height + p;
			var downMove = tBottom - oTop + p;

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
	 The largest width a passage will have onscreen, in pixels.
	 This is used by intersects() and displace().

	 @property {Number} width
	 @static
	 @final
	**/

	width: 100,

	/**
	 The largest height a passage will have onscreen, in pixels.
	 This is used by intersects() and displace().

	 @property {Number} height
	 @static
	 @final
	**/
	height: 100,

	/**
	 The amount of padding around a passage that should still trigger
	 intersection. This is used by intersects() and displace().

	 @property {Number} padding
	 @static
	 @final
	**/
	padding: 12.5,

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

/**
 Locates a passage by ID. If none exists, then this returns null.

 @method withId
 @param {Number} id id of the passage 
 @static
 @return {Passage} matching passage 
**/

Passage.withId = function (id)
{
	return PassageCollection.all().findWhere({ id: id });
};
