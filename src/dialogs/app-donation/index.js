// Shows a dialog asking the user to make a donation.

const Vue = require('vue');
const { setPref } = require('../../data/actions/pref');

require('./index.less');

// How long we wait after the user first starts using Twine to show a message
// asking for a donation, in milliseconds. This is currently 14 days.

const DONATION_DELAY = 1000 * 60 * 60 * 24 * 14;

const donation = module.exports = {
	check(store) {
		const now = new Date().getTime();

		if (!store.state.pref.donateShown &&
			now > store.state.pref.firstRunTime + DONATION_DELAY) {
			setPref(store, 'donateShown', true);
			new donation.component().$mountTo(document.body);
		}
	},

	component: Vue.extend({
		template: require('./index.html'),

		methods: {
			donate() {
				window.open('https://twinery.org/donate');
				this.$refs.modal.close();
			},

			close() {
				this.$refs.modal.close();
			}
		},

		components: {
			'modal-dialog': require('../../ui/modal-dialog')
		}
	})
};

