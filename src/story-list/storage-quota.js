'use strict';
const Backbone = require('backbone');
const locale = require('../locale');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
		this.render();
	},

	render() {
		const usedEl = this.$('.used');
		const percentEl = this.$('.percent');

		// special case: we have no stories

		if (this.parent.collection.length === 0) {
			usedEl.css('display', 'none');
			percentEl.text(locale.say('%d%% space available', 100));
			return;
		}

		// otherwise, we test in 100k chunks
		
		const used = JSON.stringify(window.localStorage).length;
		const testString = new Array(102400).join('x');
		let free = 102400;
		let storageIndex = 0;

		const interval = window.setInterval(() => {
			let stop = false;

			try {
				window.localStorage.setItem('__quotatest' + storageIndex, testString);
				free += 102400;
				storageIndex++;

				const percent = Math.round(used / (used + free) * 100);

				percentEl.text(locale.say('%d%% space available', 100 - percent));

				if (percent <= 1) {
					usedEl.css('width', '0.25em');
					percentEl.text(locale.say('%d%% space available', 99));
					stop = true;
				}
				else {
					usedEl.css('width', percent + '%');
				}
			}
			catch (e) {
				stop = true;
			}

			if (stop) {
				for (let i = 0; i <= storageIndex; i++) {
					window.localStorage.removeItem('__quotatest' + i);
				}

				window.clearInterval(interval);
			}
		}, 20);
	}
});
