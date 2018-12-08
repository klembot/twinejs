/*
This is an gauge that shows how much space is available in the user's local
storage. It's only applicable when the app is running in a Web browser.
*/

const Vue = require('vue');
const isElectron = require('../../electron/is-electron');
const locale = require('../../locale');

require('./index.less');

const CHUNK_SIZE = 102400;

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		used: 0,
		free: 0,
		show: !isElectron()
	}),

	computed: {
		percent() {
			return Math.round((this.free / (this.used + this.free)) * 100);
		},

		percentDesc() {
			return locale.say('%d%% space available', this.percent);
		}
	},

	created() {
		if (!this.show) {
			return;
		}

		/*
		We know how much space we're already using. We find out how much is
		free by trying to allocate more in 100k chunks, and failing once
		we've hit the quota.
		*/

		this.used = JSON.stringify(window.localStorage).length;
		this.free = CHUNK_SIZE;

		let storageIndex = 0;

		/* This is used to test how much local storage is left in 100k chunks. */

		let testString = 'x'.repeat(CHUNK_SIZE);
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
				} catch (e) {
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
