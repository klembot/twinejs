/*
//passage

Exports a class representing a single node in a story, which extends `Backbone.Model`.
*/

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var locale = require('../../locale');
var ui = require('../../ui');
var dataTemplate = require('./data.ejs');

var Passage = Backbone.Model.extend(
{
	defaults: _.memoize(function()
	{
		return {
			story: -1,
			top: 0,
			left: 0,
			tags: [],
			name: locale.say('Untitled Passage'),
			text: ui.hasPrimaryTouchUI() ?
			      locale.say('Tap this passage, then the pencil icon to edit it.') :
			      locale.say('Double-click this passage to edit it.')
		};
	}),

	template: dataTemplate,

	initialize: function()
	{
		this.on('change', function (model)
		{
			// Clamp our position to positive coordinates.

			var attrs = model.changedAttributes();

			if (attrs.top !== null && attrs.top < 0)
				model.set('top', 0);

			if (attrs.left !== null && attrs.left < 0)
				model.set('left', 0);
		});
	},

	validate: function (attrs, options)
	{
		if (options.noValidation)
			return;

		if (! attrs.name || attrs.name === '')
			return locale.say('You must give this passage a name.');

		if (options.noDupeValidation)
			return;

		/*
		Check for a duplicate name in this passage's story.  We require the
		`data` module here to avoid problems with a cyclic dependency.
		*/

		var data = require('../index');

		if (data.passagesForStory(data.storyForPassage(this)).find(function (passage)
		    {
				return (attrs.id != passage.id &&
						attrs.name.toLowerCase() == passage.get('name').toLowerCase());
		    }))
			return locale.say('There is already a passage named "%s." Please give this one a unique name.',
			                  attrs.name);
	},

	/*
	Returns a short excerpt of this passage's text, truncating with
	ellipses if needed.

	@method excerpt
	@return {String} the excerpt
	*/

	excerpt: function()
	{
		var text = _.escape(this.get('text'));

		if (text.length > 100)
			return text.substr(0, 99) + '&hellip;';
		else
			return text;
	},

	/*
	Returns an array of all links in this passage's text.

	@method links
	@param {Boolean} [internalOnly] only return internal links? (i.e. not http://twinery.org)
	@return {Array} array of string names
	*/

	links: function (internalOnly)
	{
		// Begin with anything with double brackets around it.

		var matches = this.get('text').match(/\[\[.*?\]\]/g);
		var found = {};
		var result = [];

		function arrowReplacer(a, b, c, d)
		{
			return c || d;
		};

		if (matches)
			for (var i = 0; i < matches.length; i++)
			{
				/*
				The link matching regexps ignore setter components, should they exist.
				*/

				var link = matches[i]
					/*
					Check for arrow links in either
					`[[display text->link]]` or
					`[[link<-display text]]` format.

					They may also have a setter component, in
					`[[display text->link][...]]` or
					`[[link<-display text][...]]` format.

					This regexp will interpret the rightmost `->` and the leftmost `<-` as the divider.
					*/
					.replace(/\[\[(?:([^\]]*)\->|([^\]]*?)<\-)([^\]]*)(?:\]\[.*?)?\]\]/g, arrowReplacer)
					/*
					Check for TiddlyWiki-style links in
					`[[display text|link]]` format, or with a settter component:
					`[[display text|link][...]]`
					*/
					.replace(/\[\[([^\|\]]*?)\|([^\|\]]*)?(?:\]\[.*?)?\]\]/g, '$2')
					/*
					Simple `[[link]]` format, or with a setter component:
					`[[link][...]]`
					*/
					.replace(/\[\[|(?:\]\[.*?)?\]\]/g, '');

				// Exclude empty links, i.e. `[[]]`.

				if (link !== '' && found[link] === undefined)
				{
					result.push(link);
					found[link] = true;
				};
			};

		// We treat any link that begins with a URL protocol, e.g. `http://`,
		// as an external link.

		if (internalOnly)
			return _.filter(result, function (link)
			{
				return ! /^\w+:\/\/\/?\w/i.test(link);
			});
		else
			return result;
	},

	/*
	Replaces all links with another one.
	This is used most often to update links after a passage is renamed.

	@method replaceLink
	@param {String} oldLink passage name to replace
	@param {String} newLink passage name to replace with
	*/

	replaceLink: function (oldLink, newLink)
	{
		// TODO: add hook for story formats to be more sophisticated

		var simpleLinkRegexp = new RegExp('\\[\\[' + oldLink + '(\\]\\[.*?)?\\]\\]', 'g');
		var compoundLinkRegexp = new RegExp('\\[\\[(.*?)(\\||->)' + oldLink + '(\\]\\[.*?)?\\]\\]', 'g');
		var reverseLinkRegexp = new RegExp('\\[\\[' + oldLink + '(<-.*?)(\\]\\[.*?)?\\]\\]', 'g');
		var oldText = this.get('text');
		var text = oldText;

		text = text.replace(simpleLinkRegexp, '[[' + newLink + '$1]]');
		text = text.replace(compoundLinkRegexp, '[[$1$2' + newLink + '$3]]');
		text = text.replace(reverseLinkRegexp, '[[' + newLink + '$1$2]]');

		if (text != oldText)
			this.save({ text: text });
	},

	/*
	Checks whether the passage name or body matches a search string.

	@method matches
	@param {RegExp} search regular expression to search for
	@return {Boolean} whether a match is found
	*/

	matches: function (search)
	{
		return search.test(this.get('name')) || search.test(this.get('text'));
	},

	/*
	Returns the total number of string matches in this passage for a regular expression.

	@method numMatches
	@param {RegExp} search regular expression to search for
	@param {Boolean} [checkName] include the passage name in the search?
	@return {Number} number of matches; 0 if none
	*/

	numMatches: function (search, checkName)
	{
		var result = 0;
		search = new RegExp(search.source, 'g' + (search.ignoreCase ? 'i' : ''));
		var textMatches = this.get('text').match(search);
		var nameMatches = 0;

		if (checkName)
			nameMatches = this.get('name').match(search);

		result = (nameMatches ? nameMatches.length : 0) + (textMatches ? textMatches.length : 0);
		return result;
	},

	/*
	Performs a regexp replacement on this passage's text, and optionally its name.

	@method replace
	@param {RegExp} search regular expression to replace
	@param {String} replacement replacement string
	@param {Boolean} [inName] perform this replacement in the passage name too?
	*/

	replace: function (search, replacement, inName)
	{
		if (inName)
			this.save(
			{
				name: this.get('name').replace(search, replacement),
				text: this.get('text').replace(search, replacement)
			});
		else
			this.save({ text: this.get('text').replace(search, replacement) });
	},

	/*
	Publishes the passage to an HTML fragment.

	@method publish
	@param {Number} id numeric id to assign to the passage, *not* this one's DB id
	@return {String} HTML fragment
	*/

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

	/*
	Checks whether this passage intersects another onscreen.

	@method intersects
	@param {Passage} other Other passage to check.
	@return {Boolean} Whether there is an intersection.
	*/

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

	/*
	Moves another passage so that it no longer intersects this one.
	This moves the passage along either the X or Y axis only --
	whichever direction will cause the passage to move the least.

	@method displace
	@param {Passage} other Other passage to displace.
	*/

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

		// Calculate overlap amounts.
		// This is cribbed from
		// http://frey.co.nz/old/2007/11/area-of-two-rectangles-algorithm/

		var xOverlap = Math.min(tRight, oRight) - Math.max(tLeft, oLeft);
		var yOverlap = Math.min(tBottom, oBottom) - Math.max(tTop, oTop);

		// Resolve horizontal overlap.

		var xChange, yChange;

		if (xOverlap !== 0)
		{
			var leftMove = (oLeft - tLeft) + Passage.width + p;
			var rightMove = tRight - oLeft + p;

			if (leftMove < rightMove)
				xChange = -leftMove;
			else
				xChange = rightMove;
		};

		// Resolve vertical overlap.

		if (yOverlap !== 0)
		{
			var upMove = (oTop - tTop) + Passage.height + p;
			var downMove = tBottom - oTop + p;

			if (upMove < downMove)
				yChange = -upMove;
			else
				yChange = downMove;
		};

		// Choose the axis that moves the other passage the least.

		if (Math.abs(xChange) > Math.abs(yChange))
			other.set('top', oTop + yChange);
		else
			other.set('left', oLeft + xChange);
	}
},
{
	/*
	The largest width a passage will have onscreen, in pixels.
	This is used by intersects() and displace().

	@property width
	@type Number
	@static
	@constant
	*/

	width: 100,

	/**
	The largest height a passage will have onscreen, in pixels.
	This is used by intersects() and displace().

	@property height
	@type Number
	@static
	@constant
	*/
	height: 100,

	/*
	The amount of padding around a passage that should still trigger
	intersection. This is used by intersects() and displace().

	@property padding
	@type Number
	@static
	@constant
	*/
	padding: 12.5
});

module.exports = Passage;
