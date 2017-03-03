// This is a list of notifications at the top of the page. See index.js for the
// public API for this.

const Vue = require('vue');

require('./list.less');

// How long typical notifications (e.g. that aren't errors) appear onscreen.

const APPEAR_DURATION = 3000;

module.exports = Vue.extend({
	template: require('./list.html'),

	data: () => ({
		notifications: []
	}),

	methods: {
		// Adds a new notification.

		add(html, className) {
			// If the most recent notification matches the same HTML as what's
			// requested, update its count instead and reset its timeout.

			if (this.notifications.length > 0) {
				let lastN = this.notifications[this.notifications.length - 1];

				if (lastN.html === html) {
					lastN.repeats++;

					if (lastN.className !== 'danger') {
						window.clearTimeout(lastN.timeout);
						lastN.timeout = window.setTimeout(
							() => this.remove(lastN),
							APPEAR_DURATION
						);
					}

					return;
				}
			}

			let notification = { html, className, repeats: 0 };

			this.notifications.push(notification);

			if (className !== 'danger') {
				notification.timeout = window.setTimeout(
					() => this.remove(notification),
					APPEAR_DURATION
				);
			}
		},

		// Removes a notification by object reference. If none match, this does
		// nothing.

		remove(obj) {
			let index = this.notifications.indexOf(obj);

			if (index !== -1) {
				this.notifications.splice(index, 1);
			}
		},

		// Removes a notification by array index.

		removeAt(index) {
			this.notifications.splice(index, 1);
		}
	}
});
