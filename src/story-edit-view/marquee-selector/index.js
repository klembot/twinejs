// A marquee selection tool for passage items.

const Vue = require('vue');
const domEvents = require('../../vue/mixins/dom-events');
const rect = require('../../common/rect');
const { selectPassages } = require('../../data/actions/passage');

require('../../ui/ie-mouse-event-polyfill');
require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		visible: false,

		/*
		Where the selection began, and where the user is currently pointing.
		*/

		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,

		/*
		Is this an additive selection, e.g. keeping what was selected in
		place?
		*/

		additive: false,
		originallySelected: []
	}),

	computed: {
		/*
		The rectangle encompasing this selection in screen coordinates.
		*/

		screenRect() {
			if (!this.visible) {
				return;
			}

			let result = {};

			if (this.startX < this.currentX) {
				result.left = this.startX;
				result.width = this.currentX - this.startX;
			}
			else {
				result.left = this.currentX;
				result.width = this.startX - this.currentX;
			}

			if (this.startY < this.currentY) {
				result.top = this.startY;
				result.height = this.currentY - this.startY;
			}
			else {
				result.top = this.currentY;
				result.height = this.startY - this.currentY;
			}

			return result;
		},

		/*
		The rectangle encompasing this selection in logical space -- this,
		factoring in the story's zoom level.
		*/

		logicalRect() {
			const { zoom } = this.story;

			if (!this.screenRect) {
				return;
			}

			return {
				top: this.screenRect.top / zoom,
				left: this.screenRect.left / zoom,
				width: this.screenRect.width / zoom,
				height: this.screenRect.height / zoom
			};
		},

		/*
		How the above translates into CSS properties.
		*/

		css() {
			if (!this.screenRect) {
				return { display: 'none' };
			}

			return {
				left: this.screenRect.left + 'px',
				top: this.screenRect.top + 'px',
				width: this.screenRect.width + 'px',
				height: this.screenRect.height + 'px'
			};
		}
	},

	methods: {
		startDrag(e) {
			/*
			Only listen to clicks with the left mouse button on the background
			SVG element (e.g. links) and only when the <body> is not in
			space-bar scroll mode (see vue/directives/mouse-scrolling).
			*/

			if (e.target.nodeName !== 'svg' || e.which !== 1 ||
				document.body.classList.contains('mouseScrollReady')) {
				return;
			}

			/*
			If the user is holding down shift or control, then this is an
			additive selection. Remember the currently selected passage
			components for later.
			*/

			this.additive = e.shiftKey || e.ctrlKey;

			if (this.additive) {
				this.originallySelected = this.story.passages.filter(
					p => p.selected
				);
			}

			this.visible = true;
			document.body.classList.add('marqueeing');
			
			/*
			Set up coordinates initially. clientX and clientY don't take
			into account the window's scroll position.
			*/

			this.startX = this.currentX = e.clientX + window.pageXOffset;
			this.startY = this.currentY = e.clientY + window.pageYOffset;

			/*
			Set up event listeners to continue the drag.
			*/

			this.on(this.$parent.$el, 'mousemove', this.followDrag);
			this.on(this.$parent.$el, 'mouseup', this.endDrag);
		},

		followDrag(e) {
			/*
			It appears we get a stray movement event in the process of
			ending a drag-- ignore this case.
			*/

			if (!this.logicalRect) {
				return;
			}

			/*
			As noted above, clientX and clientY don't take into account the
			window's scroll position.
			*/

			this.currentX = e.clientX + window.pageXOffset;
			this.currentY = e.clientY + window.pageYOffset;

			this.selectPassages(this.story.id, p => {
				if (this.additive &&
					this.originallySelected.indexOf(p) !== -1) {
					return true;
				}

				return rect.intersects(this.logicalRect, p);
			});
		},

		endDrag(e) {
			/* Only listen to the left mouse button. */

			if (e.which !== 1) {
				return;
			}
			
			/*
			If the user never actually moved the mouse (e.g. this was a
			single click in the story map), deselect everything.
			*/

			if (this.screenRect && this.screenRect.width === 0 &&
				this.screenRect.height === 0) {
				this.selectPassages(this.story.id, () => false);
			}

			this.visible = false;
			document.querySelector('body').classList.remove('marqueeing');

			/* Deactivate the event listeners we had been using. */

			this.off(this.$el.parentNode, 'mousemove');
			this.off(this.$el.parentNode, 'mouseup');

			/*
			Because this component's $el has been re-rendered (entirely
			replaced) due to startDrag() and followDrag() altering the data,
			this mouseup event won't result in a click event bubbling up from
			this. To alleviate this, we generate a synthetic MouseEvent now,
			using this mouseup event's values.
			*/

			this.$el.dispatchEvent(new MouseEvent('click', e));
		}
	},

	ready() {
		this.on(this.$el.parentNode, 'mousedown', this.startDrag);
	},

	vuex: {
		actions: { selectPassages }
	},

	mixins: [domEvents]
});