// The main view where story editing takes place.

const { values } = require('underscore');
const Vue = require('vue');
const {
	createPassageInStory,
	loadFormat,
	positionPassage,
	updatePassageInStory,
	updateStory
} = require('../data/actions');
const domEvents = require('../vue/mixins/dom-events');
const locale = require('../locale');
const { passageDefaults } = require('../data/story');
const zoomSettings = require('./zoom-settings');

// A memoized, sorted array of zoom levels used when zooming in or out.

const zoomLevels = values(zoomSettings).sort();

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
		// The window's width and height. Our resize() method keeps this in sync
		// with the DOM.
		
		winWidth: window.innerWidth,
		winHeight: window.innerHeight,
		
		// The calculated width and height we maintain to allow the user to
		// always have space below and to the right of passages in the story
		// map.

		width: 0,
		height: 0,

		// The regular expression that matching passages should highlight.
		// If null, none should highlight.
	
		highlightRegexp: null,

		// The offset that selected passages should be displayed at
		// temporarily, to show feedback as the user drags passages around.

		screenDragOffsetX: 0,
		screenDragOffsetY: 0
	}),

	computed: {
		// Sets our width and height to:
		// * the size of the browser window
		// * the minimum amount of space needed to enclose all existing
		// passages
		//
		// ... whichever is bigger, plus 50% of the browser window's
		// width and height, so that there's always room for the story to
		// expand.
		
		cssDimensions() {
			let width = this.winWidth;
			let height = this.winHeight;
			let passagesWidth = 0;
			let passagesHeight = 0;

			this.story.passages.forEach(p => {
				const right = p.left + p.width;
				const bottom = p.top + p.height;

				if (right > passagesWidth) {
					passagesWidth = right;
				}

				if (bottom > passagesHeight) {
					passagesHeight = bottom;
				}
			});
			
			width = Math.max(passagesWidth * this.story.zoom, this.winWidth);
			height = Math.max(passagesHeight * this.story.zoom, this.winHeight);

			// Give some space below and to the right for the user to add
			// passages.

			width += this.winWidth / 2;
			height += this.winHeight / 2;
		
			return {
				width: width + 'px',
				height: height + 'px'
			};
		},

		// Our grid size -- for now, constant.

		gridSize() {
			return 20;
		},

		// Returns an array of currently-selected <passage-item> components. This
		// is used by the marquee selector component to do additive selections
		// by remembering what was originally selected.

		selectedChildren() {
			return this.$refs.passages.filter(p => p.selected);
		},

		// An array of <passage-item> components and their link positions,
		// indexed by name.

		passagePositions() {
			return this.$refs.passages.reduce(
				(result, passageView) => {
					result[passageView.passage.name] = passageView.linkPosition;
					return result;
				},

				{}
			);
		},
		
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		// A human readable adjective for the story's zoom level.

		zoomDesc() {
			return Object.keys(zoomSettings).find(
				key => zoomSettings[key] === this.story.zoom
			);
		}
	},

	watch: {
		'story.name': {
			handler(value) {
				document.title = value;
			},

			immediate: true
		}
	},

	ready() {
		this.resize();
		this.on(window, 'resize', this.resize);

		if (this.story.passages.length === 0) {
			this.createPassage();
		}
	},

	methods: {
		resize() {
			this.winWidth = window.innerWidth;
			this.winHeight = window.innerHeight;
		},

		// Creates a passage, optionally at a certain position onscreen. If
		// unspecified, this does so at the center of the page. This also
		// handles positioning the passage so it doesn't overlap others.

		createPassage(name, top, left) {
			// If we haven't been given coordinates, place the new passage at
			// the center of the window. We start by finding the center point
			// of the browser window in logical coordinates, e.g. taking into
			// account the current zoom level. Then, we move upward and to the
			// left by half the dimensions of a passage in logical space.

			if (!left) {
				left = (window.scrollX + window.innerWidth / 2) / this.story.zoom;
				left -= passageDefaults.width;
			}

			if (!top) {
				top = (window.scrollY + window.innerHeight / 2) / this.story.zoom;
				top -= passageDefaults.height;
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
			
			this.positionPassage(
				this.story.id,
				this.story.passages.find(p => p.name === name).id,
				this.gridSize
			);
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
		// Our children (e.g. the search field can tell us to change what the
		// highlight filter should be.

		'highlight-regexp-change'(value) {
			this.highlightRegexp = value;
		},
		
		// A hook into our createPassage() method for child components.

		'passage-create'(name, left, top) {
			this.createPassage(name, left, top);
		},

		// A child will dispatch this event to us as it is dragged around. We
		// set a data property here and other selected passages react to it by
		// temporarily shifting their onscreen position.

		'passage-drag'(xOffset, yOffset) {
			if (this.story.snapToGrid) {
				this.screenDragOffsetX = Math.round(xOffset / this.gridSize) *
					this.gridSize * this.story.zoom;
				this.screenDragOffsetY = Math.round(yOffset / this.gridSize) *
					this.gridSize * this.story.zoom;
			}
			else {
				this.screenDragOffsetX = xOffset;
				this.screenDragOffsetY = yOffset;
			}
		},

		// A child will dispatch this event at the completion of a drag. We
		// pass this onto our children, who use it as a chance to save what was
		// a temporary change in the DOM to their model.

		'passage-drag-complete'(xOffset, yOffset) {
			this.screenDragOffsetX = 0;
			this.screenDragOffsetY = 0;

			if (this.story.snapToGrid) {
				xOffset = Math.round(xOffset / this.gridSize) * this.gridSize *
					this.story.zoom;
				yOffset = Math.round(yOffset / this.gridSize) * this.gridSize *
					this.story.zoom;
			}

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

		// Positions a passage on behalf of a child component. This needs to be
		// here, as opposed to a direct Vuex action, because this allows the
		// child to ask that the positioning ignore selected passage components
		// (e.g. after finishing a drag).

		'passage-position'(passage, options) {
			this.positionPassage(
				this.story.id,
				passage.id,
				this.gridSize,
				options.ignoreSelected && (passage =>
					!this.selectedChildren.some(view =>
						view.passage.id === passage
					))
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
			positionPassage,
			updatePassageInStory,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			allStories: state => state.story.stories,
			defaultFormatName: state => state.pref.defaultFormat
		}
	},

	mixins: [domEvents]
});
