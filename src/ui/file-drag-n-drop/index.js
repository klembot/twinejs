const Vue = require('vue');
const { default: { on, off } } = require('oui-dom-events');

module.exports = Vue.extend({
	template:
		`<div :class="'drag-n-drop ' + (dragover ? 'dragover' : '')">
			<div class='label'>
				<slot></slot>
			</div>
			<div class='inner-border'></div>
		</div>`,
	data: () => ({
		dragover: false,
	}),
	ready() {
		const {$el, $parent:{$el:parentEl}} = this;

		on(parentEl, 'dragenter.file-drag-n-drop', () => {
			this.dragover = true;
		});

		on(parentEl, 'dragexit.file-drag-n-drop', () => {
			this.dragover = false;
		});
		// The below is necessary to prevent the browser from
		// opening the file directly, on drop.
		on(parentEl, 'dragover.file-drag-n-drop', e => {
			e.preventDefault();
		});
		on($el, 'drop', e => {
			e.preventDefault();
			this.$dispatch('file-drag-n-drop', e.dataTransfer.files);
			this.dragover = false;
		});
	},

	beforeDestroy() {
		off(this.$parent.$el, '.file-drag-n-drop');
	},
});
