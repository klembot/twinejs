// The main view where story editing takes place.

const _ = require('underscore');
const Vue = require('vue');
const { createPassageInStory, loadFormat, updateStory } = require('../data/actions');
const locale = require('../locale');
const { publishStoryWithFormat } = require('../data/publish');
const rect = require('../common/rect');
const save = require('../file/save');
const zoomSettings = require('./zoom-settings');

// A memoized, sorted array of zoom levels used when zooming in or out.

const zoomLevels = _.values(zoomSettings).sort();

module.exports = Vue.extend({
	template: require('./index.html'),

	// The id of the story we're editing is provided by the router.

	props: {
		storyId: {
			type: String,
			required: true
		}
	},

	data: () => ({
		// The calculated width and height we maintain to allow the user to
		// always have space below and to the right of passages in the story
		// map.

		width: 0,
		height: 0,

		// The regular expression that matching passages should highlight.
	
		highlightRegexp: null,

		// The offset that selected passages should be displayed at
		// temporarily, to show feedback as the user drags passages around.

		dragXOffset: 0,
		dragYOffset: 0
	}),

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		// Bound to the template in several places to ensure the view stays
		// at the correct size.

		cssDimensions() {
			return {
				width: this.width + 'px',
				height: this.height + 'px'
			};
		},

		// A human readable adjective for the story's zoom level.

		zoomDesc() {
			return Object.keys(zoomSettings).find(
				key => zoomSettings[key] === this.story.zoom
			);
		},

		// Returns an array of currently-selected <passage-item> components. This
		// is used by the marquee selector component to do additive selections
		// by remembering what was originally selected.

		selectedChildren() {
			return this.$refs.passages.filter(p => p.selected);
		},

		// An array of <passage-item> components and their outbound links, with
		// the passage name as key.

		passageLinks() {
			let result = {};

			this.$refs.passages.forEach((p) => {
				result[p.passage.name] = Object.assign(
					{ links: p.internalLinks },
					p.connectorAnchors
				);
			});

			return result;
		},

		// An array of passage names, used to check for broken links.

		passageNames() {
			return this.story.passages.map(p => p.name);
		},

		// Our grid size -- for now, constant.

		gridSize() {
			return 25 * this.zoom;
			// FIXME
			//return Passage.width / 4 * this.zoom;
		}
	},

	ready() {
		this.resize();
		this.$resizeListener = this.resize.bind(this);
		window.addEventListener('resize', this.$resizeListener);
	},

	beforeDestroy() {
		window.removeEventListener('resize', this.$resizeListener);
	},

	methods: {
		// This resizes the instance's element to either:
		// * the size of the browser window
		// * the minimum amount of space needed to enclose all existing
		// passages
		//
		// ... whichever is bigger, plus 50% of the browser window's
		// width and height, so that there's always room for the story to
		// expand.

		resize() {
			const winWidth = window.innerWidth;
			const winHeight = window.innerHeight;

			this.width = winWidth;
			this.height = winHeight;

			if (this.story.passages.length > 0) {
				let rightPassage, bottomPassage;
				let maxLeft = -Infinity;
				let maxTop = -Infinity;

				this.story.passages.forEach(p => {
					const left = p.left;
					const top = p.top;

					if (!left || !top) {
						return;
					}

					if (p.left > maxLeft) {
						maxLeft = left;
						rightPassage = p;
					}

					if (p.top > maxTop) {
						maxTop = top;
						bottomPassage = p;
					}
				});

				let passagesWidth, passagesHeight;

				if (rightPassage && bottomPassage) {
					passagesWidth =
						this.story.zoom * (rightPassage.left + 100);
					passagesHeight =
						this.story.zoom * (bottomPassage.top + 100);
				}
				else {
					passagesWidth = passagesHeight = 0;
				}

				this.width = Math.max(passagesWidth, winWidth);
				this.height = Math.max(passagesHeight, winHeight);
			}

			this.width += winWidth * 0.5;
			this.height += winHeight * 0.5;

			// Let our child components know what we've chosen to resize to.

			this.$broadcast('resize', { width: this.width, height: this.height });
		},

		// Returns whether a child <passage-item> exists with a given name.
		// This is used by <passage-item>s to update their broken-link status.

		childNamed(name) {
			return this.$refs.passages.find(p => p.name === name);
		},

		// Nudges a passage component so that it does not overlap any other
		// child, and so that it snaps to the grid if that's set in the
		// model. nb. This works with Vue components, *not* Backbone models.

		positionPassage(passage, filter) {
			// Displace by other passages. We make a writable copy of the
			// passage's logical rect, so that it can be displaced -- it's a
			// computed property, so we can't modify it directly.

			let passageRect = Object.assign({}, passage.logicalRect);

			this.$refs.passages.forEach(p => {
				if (filter && !filter(p)) {
					return;
				}

				if (p !== passage &&
					rect.intersects(passageRect, p.logicalRect)) {
					rect.displace(passageRect, p.logicalRect, 10);
				}
			});

			// Snap to the grid.

			if (this.snapToGrid) {
				const grid = passageRect.width / 4;

				passageRect.left = Math.round(passageRect.left / grid) * grid;
				passageRect.top = Math.round(passageRect.top / grid) * grid;
			}

			// Set the passage's writeable properties accordingly.
			// FIXME

			passage.top = passageRect.top;
			passage.left = passageRect.left;
		},

		// Zooms in or out based on a mouse wheel event. The user must hold
		// down the Alt or Option key for it to register.

		onWheel(e) {
			if (e.altKey && !e.ctrlKey) {
				let zoomIndex = zoomLevels.indexOf(this.story.zoom);

				// Only consider the Y component of the motion.

				if (e.wheelDeltaY > 0) {
					// Zoom in.

					zoomIndex = (zoomIndex === 0) ?
						zoomLevels.length - 1 :
						zoomIndex - 1;
				}
				else {
					// Zoom out.

					zoomIndex = (zoomIndex === zoomLevels.length - 1) ?
						0 :
						zoomIndex + 1;
				}

				this.updateStory(this.story.id, { zoom: zoomLevels[zoomIndex] });
				e.preventDefault();
			}
		}
	},

	events: {
		'highlight-regexp-change'(value) {
			this.highlightRegexp = value;
		},

		// A specialized version of collection-create that ensures a new
		// passage has a unique name, and doesn't overlap another one.

		'passage-create'(name, left, top) {
			// If we haven't been given coordinates, place the new passage at
			// the center of the window. We start by finding the center point
			// of the browser window in logical coordinates, e.g. taking into
			// account the current zoom level. Then, we move upward and to the
			// left by half the dimensions of a passage in logical space.

			if (!left) {
				left = (window.scrollX + window.innerWidth / 2) / this.story.zoom;
				left -= 100;
			}

			if (!top) {
				top = (window.scrollY + window.innerHeight / 2) / this.story.zoom;
				top -= 100;
			}

			// Make sure the name is unique. If it's a duplicate, we add a
			// number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			// 3", and so on.

			name = name || locale.say('Untitled Passage');

			if (this.story.passages.find(p => p.name === name)) {
				const origName = name;
				let nameIndex = 0;

				do {
					nameIndex++;
					name = origName + ' ' + nameIndex;
				}
				while
					(this.story.passages.find(p => p.name === name));
			}

			// Add it to our collection.

			this.createPassageInStory(this.story.id, { name, left, top });

			// Then position it so it doesn't overlap any others, and save it
			// again.
			// FIXME

			//this.positionPassage(passage);
		},

		// A child will dispatch this event to us as it is dragged around. We
		// set a data property here and other selected passages react to it by
		// temporarily shifting their onscreen position.

		'passage-drag'(xOffset, yOffset) {
			this.dragXOffset = xOffset;
			this.dragYOffset = yOffset;
		},

		// A child will dispatch this event at the completion of a drag. We
		// pass this onto our children, who use it as a chance to save what was
		// a temporary change in the DOM to their model.

		'passage-drag-complete'(xOffset, yOffset) {
			this.dragXOffset = 0;
			this.dragYOffset = 0;
			this.$broadcast('passage-drag-complete', xOffset, yOffset);
		},

		// A child will dispatch this event to us when it is selected
		// non-additively; we broadcast it to all children to deselect them.

		'passage-deselect-except'(...children) {
			this.$broadcast('passage-deselect-except', ...children);
		},

		// The marquee selector component dispatches these events as it is moved,
		// and child passage items react to it by setting their selected
		// property accordingly.
		//
		// If a component is in the always array, then it will always select
		// itself during this operation.

		'passage-select-intersects'(rect, always) {
			this.$broadcast('passage-select-intersects', rect, always);
		},

		// A passage can request that it be positioned by us with an event.

		'passage-position'(passage, filter) {
			this.positionPassage(passage, filter);
		},

		// Story-wide events.

		'story-proof'() {
			window.open(
				'#stories/' + this.story.id + '/proof',
				'twinestory_test_' + this.story.id
			);
		},

		'story-publish'() {
			const formatName = this.story.format || this.defaultFormatName;
			const format = this.allFormats.find(
				format => format.name === formatName
			);

			this.loadFormat(formatName).then(() => {
				save(
					publishStoryWithFormat(this.story, format),
					this.story.name + '.html'
				);
			});
		},

		'story-set-start'(passageId) {
			this.updateStory(this.story.id, { startPassage: passageId });
		},

		'story-test'(passageId) {
			window.open(
				'#stories/' + this.story.id + '/test' +
				((passageId) ? '/' + passageId : ''),
				'twinestory_test_' + this.story.id
			);
		}
	},

	components: {
		'link-arrows': require('./link-arrows'),
		'passage-item': require('./passage-item'),
		'story-toolbar': require('./story-toolbar'),
		'marquee-selector': require('./marquee-selector')
	},

	vuex: {
		actions: {
			createPassageInStory,
			loadFormat,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			allStories: state => state.story.stories,
			defaultFormatName: state => state.pref.defaultFormat
		}
	}
});
