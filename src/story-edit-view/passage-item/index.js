// A single passage in the story map.

const _ = require('underscore');
const Vue = require('vue');
const Passage = require('../../data/models/passage');
const StoryFormatCollection = require('../../data/collections/story-format');
const PassageEditor = require('../../editors/passage');
const backboneCollection = require('../../vue/mixins/backbone-collection');
const backboneModel = require('../../vue/mixins/backbone-model');
const { confirm } = require('../../dialogs/confirm');
const linkParser = require('../../common/link-parser');
const locale = require('../../locale');
const rect = require('../../common/rect');
const { hasPrimaryTouchUI } = require('../../ui');
const { big } = require('../zoom-settings');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: [
		// A passage
		'model',
		
		// The story containing this passage
		'parentStory',

		// An array of names of all passages in the parentStory
		'passageNames',

		// A collection of all passages in the parentStory
		'collection',
		'gridSize',
		'snapToGrid',
		'zoom',
		'dragXOffset',
		'dragYOffset',
		'highlightRegexp'
	],

	data: () => ({
		// Model attributes.

		name: '',
		top: 0,
		left: 0,
		text: '',

		// Whether we're currently selected by the user.

		selected: false,

		// Where a drag on us began.

		dragStartX: 0,
		dragStartY: 0
	}),

	computed: {
		logicalRect() {
			return {
				top: this.top,
				left: this.left,
				width: Passage.width,
				height: Passage.height
			};
		},

		screenRect() {
			return {
				top: this.top * this.zoom,
				left: this.left * this.zoom,
				width: Passage.width * this.zoom,
				height: Passage.height * this.zoom
			};
		},

		// The passed-in dragXOffset, but with the snapToGrid setting taken
		// into account. Used by connectorArrows and cssPosition.

		screenDragX() {
			let { dragXOffset, screenRect: { left } } = this;

			if (this.snapToGrid) {
				dragXOffset = Math.round((dragXOffset + left) / this.gridSize) *
					this.gridSize - left;
			}

			return dragXOffset;
		},

		// The passed-in dragYOffset, but with the snapToGrid setting taken
		// into account. Used by connectorArrows and cssPosition.

		screenDragY() {
			let { dragYOffset, screenRect: { top } } = this;

			if (this.snapToGrid) {
				dragYOffset = Math.round((dragYOffset + top) / this.gridSize) *
					this.gridSize - top;
			}

			return dragYOffset;
		},

		// Connection points used to draw link arrows to and from this
		// component in (x, y) format.

		connectorAnchors() {
			const offsetX = (this.selected) ? this.screenDragX : 0;
			const offsetY = (this.selected) ? this.screenDragY : 0;

			const {left, top, width, height} = this.screenRect;

			return {
				// The four vertices in [x1,y1,x2,y2] format.
				box: [
					left + offsetX,
					top + offsetY,
					left + width + offsetX,
					top + height + offsetY
				],
				// The center coordinate
				center: [
					left + 0.5 * width + offsetX,
					top + 0.5 * height + offsetY
				],
			};
		},

		internalLinks() {
			return linkParser(this.text, true);
		},

		hasBrokenLinks() {
			return this.internalLinks.some(
				n => this.passageNames.indexOf(n) === -1
			);
		},

		cssPosition() {
			let top = this.top * this.zoom;
			let left = this.left * this.zoom;
			// Unfortunately, the background offset used in zoom-settings.less must
			// also be hard-coded here, at least until the background graphic is
			// amended to not need this.
			let bgTop = top + (this.zoom === big ? 23 : 0);
			let bgLeft = left + (this.zoom === big ? -1 : 0);
			let result = {
				top: `${top}px`,
				left: `${left}px`,
				// The background is used to mask any intersecting connector
				// lines which would otherwise be drawn below this.
				backgroundPosition: `-${bgLeft}px -${bgTop}px`,
			};

			if (this.selected) {
				result.transform =
					`translate(${this.screenDragX}px, ${this.screenDragY}px)`;
				result.backgroundPosition =
					`-${bgLeft + this.screenDragX}px -${bgTop + this.screenDragY}px`;
			}

			return result;
		},
		
		cssClasses() {
			let result = [];

			if (this.parentStory.get('startPassage') === this.$model.id) {
				result.push('start');
			}

			if (this.selected) {
				result.push('selected');
			}

			if (this.hasBrokenLinks) {
				result.push('brokenLink');
			}

			return result;
		},

		excerpt() {
			return this.$model.excerpt();
		},
	},

	methods: {
		delete() {
			this.$model.destroy();
		},

		edit() {
			const oldText = this.text;

			new PassageEditor({
				model: this.$model,
				collection: this.$collection,
				storyFormat: StoryFormatCollection.all().findWhere(
					{ name: this.parentStory.get('storyFormat') }
				),
			}).$mountTo(document.body)
			.then(() => {
				this.createNewLinks(this.text, oldText);
			});
		},

		followDrag(e) {
			this.$dispatch(
				'passage-drag',
				e.clientX + window.scrollX - this.startDragX,
				e.clientY + window.scrollY - this.startDragY
			);
		},

		stopDrag(e) {
			// Only listen to the left mouse button.

			if (e.which !== 1) {
				return;
			}

			// Remove event listeners set up at the start of the drag.

			window.removeEventListener('mousemove', this.$onMouseMove);
			window.removeEventListener('mouseup', this.$onMouseUp);
			document.querySelector('body').classList.remove('draggingPassages');

			// If we haven't actually been moved and the shift or control key
			// were not held down, select just this passage only. This handles
			// the scenario where the user clicks a single passage when several
			// were selected. We don't want to immediately deselect them all,
			// as the user may be starting a drag; but now that we know for
			// sure that the user didn't intend this, we select just this one.

			if (this.dragXOffset === 0 && this.dragYOffset === 0) {
				if (!(e.ctrlKey || e.shiftKey)) {
					this.$dispatch('passage-deselect-except', this);
				}
			}
			else {
				this.$dispatch(
					'passage-drag-complete',
					e.clientX + window.scrollX - this.startDragX,
					e.clientY + window.scrollY - this.startDragY,
					this
				);
			}
		},

		startDrag(e) {
			// Only listen to the left mouse button.

			if (e.which !== 1) {
				return;
			}

			if (e.shiftKey || e.ctrlKey) {
				// Shift- or control-clicking toggles our selected status, but
				// doesn't affect any other passage's selected status.
				// If the shift or control key was not held down, select only
				// ourselves.

				this.selected = !this.selected;
			}
			else if (!this.selected) {
				// If we are newly-selected and the shift or control keys are
				// not held, deselect everything else. The check for
				// newly-selected status is needed so that if the user is
				// beginning a drag, we don't deselect everything right away.
				// The check for that occurs in the mouse up handler, above.

				this.selected = true;
				this.$dispatch('passage-deselect-except', this);
			}

			// Begin tracking a potential drag.

			this.startDragX = e.clientX + window.scrollX;
			this.startDragY = e.clientY + window.scrollY;
			window.addEventListener('mousemove', this.$onMouseMove);
			window.addEventListener('mouseup', this.$onMouseUp);
			document.querySelector('body').classList.add('draggingPassages');
		},

		createNewLinks(newText, oldText) {
			// Determine how many passages we'll need to create.

			const oldLinks = linkParser(oldText, true);
			const newLinks = linkParser(newText, true).filter(
				link => (oldLinks.indexOf(link) === -1) &&
					!(this.$collection.find(p => p.get('name') === link))
			);

			// We center the new passages underneath this one.
			// We defer the creation events so that the current chain of
			// execution (e.g. a pending save operation) can complete.

			const newTop = this.top + Passage.height * 1.5;

			// We account for the total width of the new passages as both the
			// width of the passages themselves plus the spacing in between.

			const totalWidth = newLinks.length * Passage.width +
				((newLinks.length - 1) * (Passage.width / 2));
			let newLeft = this.left + (Passage.width - totalWidth) / 2;

			// Send messages to create them. We defer this to allow any pending
			// save operations to complete first.

			Vue.nextTick(() => {
				newLinks.forEach((link) => {
					this.$dispatch('passage-create', link, newLeft, newTop);
					newLeft += Passage.width * 1.5;
				});
			});
		}
	},

	events: {
		'passage-edit'() {
			this.edit();
		},

		'passage-delete'(skipConfirmation) {
			if (skipConfirmation) {
				this.delete();
			}
			else {
				let message = locale.say(
					'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
					'This cannot be undone.',
					_.escape(this.name)
				);

				if (!hasPrimaryTouchUI()) {
					message += '<br><br>' + locale.say(
						'(Hold the Shift key when deleting to skip this message.)'
					);
				}

				confirm({
					message,
					buttonLabel:
						'<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
					buttonClass:
						'danger',
				})
				.then(() => this.delete());
			}
		},

		'passage-drag-complete'(xOffset, yOffset, emitter) {
			// We have to check whether we originally emitted this event, as
			// $dispatch triggers first on ourselves, then our parent.

			if (this.selected && emitter !== this) {
				// Because the x and y offsets are in screen coordinates, we
				// need to convert back to logical space.

				this.top += yOffset / this.zoom;
				this.left += xOffset / this.zoom;

				// Ask our parent to position us so we overlap no unselected
				// passages. We need to stipulate that passages are not selected so
				// that we don't inadvertantly collide with other passages being dragged.

				this.$dispatch('passage-position', this, p => !p.selected);
				this.$model.save();
			}
		},

		'passage-deselect-except'(...passages) {
			if (passages.indexOf(this) === -1) {
				this.selected = false;
			}
		},

		'passage-select-intersects'(selectRect, always) {
			if (always && always.indexOf(this) !== -1) {
				this.selected = true;
				return;
			}

			this.selected = rect.intersects(this.logicalRect, selectRect);
		}
	},

	ready() {
		this.$onMouseMove = this.followDrag.bind(this);
		this.$onMouseUp = this.stopDrag.bind(this);
	},

	components: {
		'passage-menu': require('./passage-menu')
	},

	mixins: [backboneModel, backboneCollection]
});
