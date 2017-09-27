const Vue = require('vue');
const { loadFormat } = require('../../data/actions/story-format');
const locale = require('../../locale');
const notify = require('../../ui/notify');
const semverUtils = require('semver-utils');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		loadIndex: 0,
		loadedFormats: [],
		storyId: '',
	}),

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		selectedFormat() {
			return this.loadedFormats.find(
				format => format.name === this.story.storyFormat &&
					format.version === this.story.storyFormatVersion
			);
		},

		working() {
			return this.loadIndex < this.allFormats.length;
		}
	},

	methods: {
		loadNext() {
			if (!this.working) {
				return;
			}

			const nextFormat = this.allFormats[this.loadIndex];

			this.loadFormat(nextFormat.name, nextFormat.version)
			.then(format => {
				if (!format.properties.proofing) {
					this.loadedFormats.push(format);
				}

				this.loadIndex++;
				this.loadNext();
			})
			.catch(e => {
				notify(
					locale.say(
						'The story format &ldquo;%1$s&rdquo; could not ' +
						'be loaded (%2$s).',
						nextFormat.name + ' ' + nextFormat.version,
						e.message
					),
					'danger'
				);
				this.loadIndex++;
				this.loadNext();
			});
		}
	},

	ready() {
		this.loadNext();
	},

	vuex: {
		actions: {
			loadFormat,
		},

		getters: {
			allStories: state => state.story.stories,
			allFormats: state => {
				var result = state.storyFormat.formats.map(
					format => ({ name: format.name, version: format.version })
				);
				
				result.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					
					if (a.name > b.name) {
						return 1;
					}

					const aVersion = semverUtils.parse(a.version);
					const bVersion = semverUtils.parse(b.version);

					if (aVersion.major > bVersion.major) {
						return -1;
					}
					else if (aVersion.major < bVersion.major) {
						return 1;
					}
					else {
						if (aVersion.minor > bVersion.minor) {
							return -1;
						}
						else if (aVersion.minor < bVersion.minor) {
							return 1;
						}
						else {
							if (aVersion.patch > bVersion.patch) {
								return -1;
							}
							else if (aVersion.patch < bVersion.patch) {
								return 1;
							}
							else {
								return 0;
							}
						}
					}
				});

				return result;
			}
		}
	},

	components: {
		'format-item': require('./item'),
		'modal-dialog': require('../../ui/modal-dialog')
	}
});
