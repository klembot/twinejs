/*
Manages a drag-and-drop-target on a component. When a file is dragged onto it,
this component dispatches a `file-drag-n-drop` event to its parent.
*/

const Vue = require('vue');
const domEvents = require('../../vue/mixins/dom-events');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* Whether the user has a file dragged onto this component. */

		receiving: false
	}),

	ready() {
		const parentEl = this.$parent.$el;

		/*
		Make ourselves visible when the user drags a file onto us.
		*/

		this.on(parentEl, 'dragenter', () => {
			this.receiving = true;
		});

		this.on(parentEl, 'dragexit', () => {
			this.receiving = false;
		});

		/*
		The below is necessary to prevent the browser from opening the file
		directly after the user drops a file on us.
		*/

		this.on(parentEl, 'dragover', e => {
			e.preventDefault();
		});
	},

	methods: {
		fileReceived(e) {
			this.$dispatch('file-drag-n-drop', e.dataTransfer.files);
			this.receiving = false;
		}
	},

	mixins: [domEvents]
});
