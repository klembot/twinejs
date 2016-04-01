'use strict';
const Vue = require('vue');
const {ZOOM_MAPPINGS} = require('../../story-edit/story-edit-view').prototype;
const {thenable, symbols:{resolve}} = require('../../common/vue-mixins.js');

module.exports = Vue.extend({
	data: () => ({
		zoom: 0,
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		url: "",
		reverse: false,
	}),
	template: `<div id="storyEditProxy"
		:class="'fullAppear fast ' + (reverse ? 'reverse ' : '') + zoomClass"
		:style="{transformOrigin: x + 'px ' + y + 'px'}"
		@animationend="animationend"></div>`,
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
	methods: {
		animationend() {
			this[resolve]();
			// Do not destroy this immediately: consumers may want to do an operation
			// and call $destroy() on this afterward.
		},
	},
	mixins: [thenable],
});
