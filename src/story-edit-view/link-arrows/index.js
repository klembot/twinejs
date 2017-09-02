/*
Draws connector lines between passages.
*/

const uniq = require('lodash.uniq');
const Vue = require('vue');
const linkParser = require('../../data/link-parser');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		passages: {
			type: Array,
			required: true
		},

		/*
		The positions of the passages, indexed by passage name. Each entry
		should contain top, left, width and height properties.
		*/

		positions: {
			type: Object,
			required: true
		},

		zoom: {
			type: Number,
			required: true
		}
	},

	computed: {
		/*
		A list of distinct links between passages, indexed by passage name.
		This is kept distinct from the positions property so that dragging
		passages around only triggers a redraw of the affected lines. As such,
		individual arrows *cannot* depend on the position or existence of other
		arrows-- otherwise, we'd have to recompute every link arrow when one
		changed.
		*/

		links() {
			return this.passages.reduce(
				(result, passage) => {
					result[passage.name] = uniq(linkParser(passage.text, true));
					return result;
				},

				{}
			);
		},

		cssStyle() {
			/*
			In order for the arrows to not get cut off, we have to overinflate
			our base size when scaling. It's possible to do this with an SVG
			transform instead but it seems to yield weird results -- lines not
			appearing, for example. Not sure if there are performance or
			appearance implications to either approach.
			*/
			
			return {
				transform: 'scale(' + this.zoom + ')',
				width: 100 * 1 / this.zoom + '%',
				height: 100 * 1 / this.zoom + '%',
			};
		}
	},

	components: {
		'link-arrow': require('./link-arrow')
	}
});
