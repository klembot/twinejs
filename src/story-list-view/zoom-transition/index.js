'use strict';
const Vue = require('vue');
const { ZOOM_MAPPINGS } = require('../../story-edit-view');
const { thenable, symbols:{ resolve } } = require('../../vue/mixins/thenable');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
		zoom: 0,
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		url: '',
		reverse: false,
	}),

	template: `<div id="storyEditProxy"
		:class="(reverse ? 'reverse ' : '') + zoomClass"
		:style="{transformOrigin: x + 'px ' + y + 'px'}"></div>`,

	computed: {
		zoomClass() {
			for (let desc in ZOOM_MAPPINGS) {
				if (ZOOM_MAPPINGS[desc] === this.zoom) {
					return 'zoom-' + desc;
				}
			}

			return '';
		},
	},

	ready() {
		/*
		Ugly hack to make this work on NW.js, which Vue doesn't seem to process
		animation events correctly for.
		*/

		window.setTimeout(this.animationend, 200);
	},

	methods: {
		animationend() {
			this[resolve]();

			/*
			Do not destroy this immediately: consumers may want to do an
			operation and call $destroy() on this afterward.
			*/
		},
	},

	mixins: [thenable]
});
