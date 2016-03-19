// This is an gauge that shows how much space is available in the user's local
// storage. It's only applicable when the app is running in a Web browser.

const Vue = require('vue');
const locale = require('../locale');

const CHUNK_SIZE = 102400;

// This is used to test how much local storage is left in 100k chunks. This is
// not a const so that we can set it to null when we're done checking, to
// save memory.

let testString = 'x'.repeat(CHUNK_SIZE);

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		used: 0,
		free: 0
	}),

	computed: {
		percent: function() {
			return Math.round(this.used / (this.used + this.free) * 100);
		},

		percentDesc: function() {
			return locale.say('%d%% space available', 100 - this.percent);
		}
	},

	ready() {
		// We know how much space we're already using. We find out how much is
		// free by trying to allocate more in 100k chunks, and failing once
		// we've hit the quota.

		this.used = JSON.stringify(window.localStorage).length;
		this.free = CHUNK_SIZE;

		let storageIndex = 0;
		const interval = window.setInterval(
			() => {
				let stop = false;

				try {
					window.localStorage.setItem(
						'__quotatest' + storageIndex,
						testString
					);
					this.free += CHUNK_SIZE;
					storageIndex++;

					// If we're already above 99%, then we don't need another
					// iteration.

					if (this.percent <= 1) {
						stop = true;
					}
				}
				catch (e) {
					console.log(e, this.used, this.free, this.percent);
					stop = true;
				}

				if (stop) {
					// Clean up the items we put into the local storage to test.

					for (let i = 0; i <= storageIndex; i++) {
						window.localStorage.removeItem('__quotatest' + i);
					}

					testString = null;
					window.clearInterval(interval);
				}
			},
			20
		);
	}
});
