// A single passage in the story map.

const { escape } = require('underscore');
const Vue = require('vue');
const PassageEditor = require('../../editors/passage');
const { confirm } = require('../../dialogs/confirm');
const domEvents = require('../../vue/mixins/dom-events');
const locale = require('../../locale');
const rect = require('../../common/rect');
const { hasPrimaryTouchUI } = require('../../ui');
const {
	createNewlyLinkedPassages,
	deletePassageInStory,
	updatePassageInStory
} =
	require('../../data/actions');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		passage: {
			type: Object,
			required: true
		},
		
		parentStory: {
			type: Object,
			required: true
		},

		/* The regular expression we use to highlight ourselves or not. */

		highlightRegexp: {
			type: RegExp,
			required: false
		},

		/* How dragged passages should be offset, in screen coordinates. */

		screenDragOffsetX: {
			type: Number,
			required: true
		},

		screenDragOffsetY: {
			type: Number,
			required: true
		}
	},

	data: () => ({
		/* Whether we're currently selected by the user. */

		selected: false,

		/*
		To speed initial load, we don't create a contextual menu until the user
		actually points to us. This records whether a menu component should be
		added.
		*/

		needsMenu: false,

		/*
		Where a drag on us began, in screen coordinates. Only the passage that
		is dragged by the user tracks this.
		*/

		screenDragStartX: 0,
		screenDragStartY: 0
	}),

	computed: {
		/*
		The position to use when drawing link arrows to this passage. This does
		*not* factor in the story's zoom level, as the link arrow component
		will be doing that itself.
		*/

		linkPosition() {
			let result = {
				top: this.passage.top,
				left: this.passage.left,
				width: this.passage.width,
				height: this.passage.height
			};

			if (this.selected) {
				result.left += this.screenDragOffsetX / this.parentStory.zoom;
				result.top += this.screenDragOffsetY / this.parentStory.zoom;
			}

			return result;
		},

		isStart() {
			return this.parentStory.startPassage === this.passage.id;
		},

		cssPosition() {
			const { zoom } = this.parentStory;

			return {
				left: this.passage.left * zoom + 'px',
				top: this.passage.top * zoom + 'px',
				width: this.passage.width * zoom + 'px',
				height: this.passage.height * zoom + 'px',
				transform: this.selected ?
					'translate(' + this.screenDragOffsetX + 'px, ' +
					this.screenDragOffsetY + 'px)'
					: null
			};
		},
		
		cssClasses() {
			let result = [];

			if (this.selected) {
				result.push('selected');
			}

			if (this.highlightRegexp && (
				this.highlightRegexp.test(this.passage.name) ||
				this.highlightRegexp.test(this.passage.text))) {
				result.push('highlighted');
			}

			return result;
		},

		excerpt() {
			if (this.passage.text.length < 100) {
				return escape(this.passage.text);
			}

			return escape(this.passage.text.substr(0, 99)) + '&hellip;';
		},
	},

	methods: {
		delete() {
			this.deletePassageInStory(this.parentStory.id, this.passage.id);
		},

		edit() {
			const oldText = this.passage.text;

			new PassageEditor({
				data: {
					passageId: this.passage.id,
					storyId: this.parentStory.id
				},
				store: this.$store,
				storyFormat: this.parentStory.storyFormat,
			})
			.$mountTo(document.body)
			.then(() => {
				this.createNewlyLinkedPassages(
					this.parentStory.id,
					this.passage.id,
					oldText
				);
			});
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

			this.screenDragStartX = e.clientX + window.scrollX;
			this.screenDragStartY = e.clientY + window.scrollY;
			this.on(window, 'mousemove', this.followDrag);
			this.on(window, 'mouseup', this.stopDrag);
			document.querySelector('body').classList.add('draggingPassages');
		},

		followDrag(e) {
			this.$dispatch(
				'passage-drag',
				e.clientX + window.scrollX - this.screenDragStartX,
				e.clientY + window.scrollY - this.screenDragStartY
			);
		},

		stopDrag(e) {
			// Only listen to the left mouse button.

			if (e.which !== 1) {
				return;
			}

			// Remove event listeners set up at the start of the drag.
			this.off(window, 'mousemove');
			this.off(window, 'mouseup');
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
					e.clientX + window.scrollX - this.screenDragStartX,
					e.clientY + window.scrollY - this.screenDragStartY,
					this
				);
			}
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
					escape(this.passage.name)
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

				this.updatePassageInStory(
					this.parentStory.id,
					this.passage.id,
					{
						top: this.passage.top + yOffset / this.parentStory.zoom,
						left: this.passage.left + xOffset / this.parentStory.zoom
					}
				);

				// Ask our parent to position us so we overlap no unselected
				// passages. We need to stipulate that passages are not selected so
				// that we don't inadvertantly collide with other passages being dragged.

				this.$dispatch(
					'passage-position',
					this.passage,
					{ ignoreSelected: true }
				);
			}

			// Tell our menu that our position has changed, so that it in turn
			// can change its position.

			this.$broadcast('drop-down-reposition');
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

			this.selected = rect.intersects(this.passage, selectRect);
		}
	},

	components: {
		'passage-menu': require('./passage-menu')
	},

	vuex: {
		actions: {
			createNewlyLinkedPassages,
			updatePassageInStory,
			deletePassageInStory
		}
	},

	mixins: [domEvents]
});
