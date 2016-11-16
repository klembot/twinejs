/*
Shows detail about a selected format.
*/

const Vue = require('vue');

module.exports = Vue.extend({
	props: {
		working: true,
		format: null
	},

	computed: {
		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		}
	},

	template: require('./detail.html')
});
