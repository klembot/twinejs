// A modal that allows the user to choose what story format to use with a
// story.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		formats: [],
		loadedFormats: [],
		story: null
	}),

	computed: {
		working() {
			return this.formats.length > 0;
		}
	},

	methods: {
		loadNext() {
			if (this.formats.length === 0) {
				return;
			}

			let format = this.formats.shift();

			format.load(() => {
				if (!format.properties.proofing) {
					this.loadedFormats.unshift(Object.assign(
						format.properties, format.toJSON())
					);
				}

				this.loadNext();
			});
		}
	},

	ready() {
		this.loadNext();
	},

	components: {
		'format-item': require('./item'),
		'modal-dialog': require('../../ui/modal-dialog')
	}
});