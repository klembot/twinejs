/**
 Manages drawing the arrows connecting linked passages, and re-renders passages
 to keep their broken link status current.

 @class StoryEditView.LinkManager
 @extends Backbone.View
**/

'use strict';
const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const SVG = require('svg.js');

module.exports = Backbone.View.extend({
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

	initialize(options) {
		/**
		 The parent view.

		 @property {StoryEditView} parent
		**/

		this.parent = options.parent;

		/**
		 The SVG element we draw to.

		 @property svg
		**/

		this.svg = SVG(this.parent.$('.passages .content')[0]);

		/**
		 Tracks passage positions and links to speed up drawing operations.
		 Call cachePassage() to update a passage in the cache.

		 @property {Object} passageCache
		**/

		this.passageCache = {};

		/**
		 A lookup for the drawn connector SVG objects, in the format
		 this.lineCache[start passage name][end passage name].

		 @property {Object} lineCache
		**/

		this.lineCache = {};

		// keep draw cache in sync with collection changes

		this.listenTo(this.parent.collection, 'change:name', function(item) {
			delete this.passageCache[item.previous('name')];
			// caching the new version is handled below
		})
		.listenTo(this.parent.collection, 'change', function(item) {
			this.cachePassage(item);
			this.drawAll();

			// any passage that links or linked to this one
			// needs to be re-rendered, to update its broken-link status

			const oldName = item.previous('name');
			const newName = item.get('name');

			_.each(this.passageCache, function(props, pName) {
				if (_.contains(props.links, oldName) ||
					_.contains(props.links, newName)) {
					this.parent.children.find(v => {
						if (v.model.get('name') == pName) {
							v.render();
							return true;
						}
					});
				};
			}, this);
		})
		.listenTo(this.parent.collection, 'add', function(item) {
			this.cachePassage(item);
			this.drawAll();
			
			const name = item.get('name');

			_.each(this.passageCache, function(props, pName) {
				if (_.contains(props.links, name)) {
					this.parent.children.find(v => {
						if (v.model.get('name') == pName) {
							v.render();
							return true;
						}
					});
				}
			}, this);
		})
		.listenTo(this.parent.collection, 'remove', function(item) {
			const name = item.get('name');

			delete this.passageCache[name];
			this.drawAll();

			// any passage that links or linked to this one
			// needs to be re-rendered

			_.each(this.passageCache, function(props, pName) {
				if (_.contains(props.links, name)) {
					this.parent.children.find(v => {
						if (v.model.get('name') == pName) {
							v.render();
							return true;
						}
					});
				}
			}, this);
		})
		.listenTo(this.parent.model, 'change:zoom', function() {
			// this must be deferred so that the DOM has a chance to update

			_.defer(this.reset.bind(this));
		})
		.listenTo(this.parent.model, 'change:startPassage', function() {
			const oldStart = this.parent.collection.findWhere({
				id: this.parent.model.previous('startPassage')
			});
			const newStart = this.parent.collection.findWhere({
				id: this.parent.model.get('startPassage')
			});

			if (oldStart) {
				this.cachePassage(oldStart);
			}

			if (newStart) {
				this.cachePassage(newStart);
			}

			this.drawAll();
		});

		$('body').on({
			'passagedragstart.link-manager': this.prepDrag.bind(this),
			'passagedrag.link-manager': this.followDrag.bind(this)
		});

		// for some reason, jQuery can't see the position of the passages yet,
		// so we defer

		_.defer(this.reset.bind(this));
	},

	/**
	 Does cleanup of stuff set up in initialize().

	 @method destroy
	 @private
	**/

	destroy() {
		$('body').off('.link-manager');
	},

	/**
	 Forces a re-cache of all passages.

	 @method reset
	**/

	reset() {
		this.passageCache = {};
		this.parent.collection.each(function(item) {
			this.cachePassage(item);
		}, this);

		this.drawAll();
	},

	/**
	 Draws all connectors, which is a fairly expensive operation.

	 @method drawAll
	**/

	drawAll() {
		const drawArrows = (this.parent.model.get('zoom') > 0.25);

		this.svg.clear();
		this.lineCache = {};

		for (let startName in this.passageCache) {
			if (!this.passageCache.hasOwnProperty(startName)) {
				continue;
			}

			const links = this.passageCache[startName].links;

			for (let j = links.length - 1; j >= 0; j--) {
				const endName = links[j];

				this.drawConnector(startName, endName, drawArrows);
			}
		};
	},

	/**
	 Draws or updates a single connector from one passage to another.
	 If either is not previously cached via cachePassage, then this does
	 nothing.

	 @method drawConnector
	 @param {String} start Name of the start passage
	 @param {String} end Name of the end passage
	 @param {Boolean} arrowhead Include an arrowhead?
	**/

	drawConnector(start, end, arrowhead) {
		const p = this.passageCache[start];
		const q = this.passageCache[end];

		if (!(p && q)) { return; }

		// find the closest sides to connect

		const xDist = q.n[0] - p.n[0];
		const yDist = q.n[1] - p.n[1];
		const slope = Math.abs(xDist / yDist);
		let line;

		// hardcoded aesthetics :-|

		if (slope < 0.8 || slope > 1.3) {
			// connect sides

			if (Math.abs(xDist) > Math.abs(yDist)) {
				if (xDist > 0) {
					line = [p.e, q.w];
				}
				else {
					line = [p.w, q.e];
				}
			}
			else {
				if (yDist > 0) {
					line = [p.s, q.n];
				}
				else {
					line = [p.n, q.s];
				}
			}
		}
		else {
			// connect corners

			if (xDist < 0) {
				if (yDist < 0) {
					line = [p.ne, q.sw];
				}
				else {
					line = [p.se, q.nw];
				}
			}
			else {
				if (yDist < 0) {
					line = [p.nw, q.se];
				}
				else {
					line = [p.sw, q.ne];
				}
			}
		}

		// line is now an array of two points: 0 is the start, 1 is the end
		// add arrowheads as needed

		if (arrowhead) {
			const head1 = this.endPointProjectedFrom(
				line,
				this.ARROW_ANGLE,
				this.ARROW_SIZE
			);
			const head2 = this.endPointProjectedFrom(
				line,
				-this.ARROW_ANGLE,
				this.ARROW_SIZE
			);

			line.push(head1, [line[1][0], line[1][1]], head2);
		}

		// cache the line as we draw it

		this.lineCache[start] = this.lineCache[start] || {};

		if (this.lineCache[start][end]) {
			this.lineCache[start][end].remove();
		}

		this.lineCache[start][end] = this.svg.polyline(line);
	},

	/**
	 Projects a point from the endpoint of a line at a certain angle and
	 distance.
	 
	 @method endPointProjectedFrom
	 @param {Array} line An array of two points, each an array in [x, y] format
	 @param {Number} angle Angle in radians to project from the endpoints
	 @param {Number} distance Distance the projected line should have
	 @return Array
	**/

	endPointProjectedFrom(line, angle, distance) {
		const length = Math.sqrt(Math.pow(line[1][0] - line[0][0], 2) +
		Math.pow(line[1][1] - line[0][1], 2));

		if (length === 0) {
			return line[1];
		}

		// taken from http://mathforum.org/library/drmath/view/54146.html

		const lengthRatio = distance / length;

		const x = line[1][0] - ((line[1][0] - line[0][0]) * Math.cos(angle) -
		(line[1][1] - line[0][1]) * Math.sin(angle)) * lengthRatio;
		const y = line[1][1] - ((line[1][1] - line[0][1]) * Math.cos(angle) +
		(line[1][0] - line[0][0]) * Math.sin(angle)) * lengthRatio;

		return [x, y];
	},

	/**
	 Prepares for the user dragging passages around by remembering
	 various things we'll need to now to update on each mouse motion event,
	 so we can be as efficient as possible.

	 @method prepDrag
	 @private
	**/

	prepDrag() {
		/**
		 Should arrowheads be drawn while dragging?

		 @property drawArrowsWhileDragging
		 @private
		**/

		this.drawArrowsWhileDragging = (this.parent.model.get('zoom') > 0.25);

		/**
		 An array of passages models currently being dragged.

		 @property draggedPassages
		 @private
		**/
		
		this.draggedPassages = [];
		const draggedNames = [];

		this.parent.children.each(function(view) {
			if (view.selected) {
				this.draggedPassages.push(view.model);
				draggedNames.push(view.model.get('name'));
			}
		}, this);

		/**
		 An array of connections that are dependant on the dragged passages,
		 e.g. need to be redrawn every frame the mouse is moved.

		 @property draggedConnectors
		 @private
		**/

		this.draggedConnectors = [];

		_.each(this.passageCache, function(props, startName) {
			const alwaysInclude = (draggedNames.indexOf(startName) != -1);

			for (let i = props.links.length - 1; i >= 0; i--) {
				const endName = props.links[i];

				if (alwaysInclude || draggedNames.indexOf(endName) != -1) {
					this.draggedConnectors.push([startName, endName]);
				}
			}
		}, this);
	},

	/**
	 Re-caches dragged passages in flight and updates connectors.

	 @method followDrag
	 @private
	**/

	followDrag() {
		for (let i = this.draggedPassages.length - 1; i >= 0; i--) {
			this.cachePassage(this.draggedPassages[i]);
		}

		for (let i = this.draggedConnectors.length - 1; i >= 0; i--) {
			this.drawConnector(
				this.draggedConnectors[i][0],
				this.draggedConnectors[i][1],
				this.drawArrowsWhileDragging
			);
		}
	},

	/**
	 Updates the draw cache for a passage. This must occur whenever a passage's
	 position, name, or text changes. All of these can affect links drawn. This
	 uses the passage's position onscreen instead of its model's position,
	 since we need to draw links as the passage is dragged around onscreen,
	 i.e. before any changes are saved to the model.

	 @method cachePassage
	 @param {Passage} passage Passage to cache.
	**/

	cachePassage(passage) {
		const offset = this.$('.passages').offset();
		const passEl = this.$(
			'.passages div[data-id="' + passage.id + '"] .frame'
		);
		const pos = passEl.offset();
		const width = passEl.outerWidth();
		const height = passEl.outerHeight();
		
		// if the passage hasn't been rendered yet, there's nothing to cache
		// yet

		if (pos) {
			const x = pos.left - offset.left;
			const y = pos.top - offset.top;

			this.passageCache[passage.get('name')] = {
				ne: [x, y],
				n: [x + width / 2, y],
				nw: [x + width, y],
				se: [x, y + height],
				e: [x + width, y + height / 2],
				w: [x, y + height / 2],
				s: [x + width / 2, y + height],
				sw: [x + width, y + height],
				links: passage.links()
			};
		}
	}
});
