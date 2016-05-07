// A single passage in the story map.

const _ = require('underscore');
const Vue = require('vue');
const Passage = require('../../data/models/passage');
const PassageEditor = require('../../editors/passage');
const backboneCollection = require('../../vue/mixins/backbone-collection');
const backboneModel = require('../../vue/mixins/backbone-model');
const { confirm } = require('../../dialogs/confirm');
const linkParser = require('../../common/link-parser');
const locale = require('../../locale');
const rect = require('../../common/rect');
const { hasPrimaryTouchUI } = require('../../ui');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: [
		'model',
		'parentStory',
		'collection',
		'zoom',
		'dragX',
		'dragY',
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

		// Connection points used to draw link arrows to and from this
		// component in (x, y) format.

		connectorAnchors() {
			const offsetX = (this.selected) ? this.dragX : 0;
			const offsetY = (this.selected) ? this.dragY : 0;

			return {
				nw: [
					this.screenRect.left + offsetX,
					this.screenRect.top + offsetY
				],
				n: [
					this.screenRect.left + 0.5 * this.screenRect.width + offsetX,
					this.screenRect.top + offsetY
				],
				ne: [
					this.screenRect.left + this.screenRect.width + offsetX,
					this.screenRect.top + offsetY
				],
				w: [
					this.screenRect.left + offsetX,
					this.screenRect.top + 0.5 * this.screenRect.height + offsetY
				],
				e: [
					this.screenRect.left + this.screenRect.width + offsetX,
					this.screenRect.top + 0.5 * this.screenRect.height + offsetY
				],
				sw: [
					this.screenRect.left + offsetX,
					this.screenRect.top + this.screenRect.height + offsetY
				],
				s: [
					this.screenRect.left + 0.5 * this.screenRect.width + offsetX,
					this.screenRect.top + this.screenRect.height + offsetY
				],
				se: [
					this.screenRect.left + this.screenRect.width + offsetX,
					this.screenRect.top + this.screenRect.height + offsetY
				]
			};
		},

		internalLinks() {
			return linkParser(this.text, true);
		},

		hasBrokenLinks() {
			return this.internalLinks.some(
				p => !this.$collection.find(q => q.get('name') === p)
			);
		},

		cssPosition() {
			let result = {
				top: this.top * this.zoom + 'px',
				left: this.left * this.zoom + 'px',
			};

			if (this.selected) {
				result.transform = `translate(${this.dragX}px, ${this.dragY}px)`;
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
				collection: this.$collection
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

			if (this.dragX === 0 && this.dragY === 0) {
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
