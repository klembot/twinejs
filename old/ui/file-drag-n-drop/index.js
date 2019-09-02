/*
Manages a drag-and-drop-target on a component. When a file is dragged onto it,
this component dispatches a `file-drag-n-drop` event to its parent.
*/

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import domEvents from '../../vue/mixins/dom-events';
import template from './index.html';
import './index.less';

export default Vue.extend({
	template,
	data: () => ({
		/* Whether the user has a file dragged onto this component. */
		receiving: false
	}),
	mounted() {
		this.$nextTick(function() {
			/* code that assumes this.$el is in-document */
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
		});
	},
	methods: {
		fileReceived(e) {
			eventHub.$emit('file-drag-n-drop', e.dataTransfer.files);
			this.receiving = false;
		}
	},

	mixins: [domEvents]
});
