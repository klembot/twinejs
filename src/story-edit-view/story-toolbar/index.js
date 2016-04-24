// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const Passage = require('../../data/models/passage');
const backboneModel = require('../../vue/mixins/backbone-model');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		name: '',
		zoom: 1,
		parent: Object
	}),

	computed: {
		zoomDesc() {
			return Object.keys(this.parent.ZOOM_MAPPINGS).find(
				key => this.parent.ZOOM_MAPPINGS[key] === this.zoom
			);
		},

		passageViews() {
			return this.parent.children;
		}
	},

	components: {
		'story-menu': require('./story-menu'),
		'story-search': require('./story-search')
	},
	
	methods: {
		setZoom(description) {
			this.zoom = this.parent.ZOOM_MAPPINGS[description];
		},

		test() {
			window.open(
				'#stories/' + this.$model.id + '/test',
				'twinestory_test_' + this.$model.id
			);
		},

		play() {
			window.open(
				'#stories/' + this.$model.id + '/play',
				'twinestory_play_' + this.$model.id
			);
		},

		addPassage() {
			this.parent.addPassage();
		}
	},

	mixins: [backboneModel]
});

