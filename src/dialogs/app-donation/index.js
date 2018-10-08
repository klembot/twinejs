// Shows a dialog asking the user to make a donation.

const Vue = require('vue');
const { setPref } = require('../../data/actions/pref');
const locale = require('../../locale');

require('./index.less');

// How long we wait after the user first starts using Twine to show a message
// asking for a donation, in milliseconds. This is currently 14 days.

const DONATION_DELAY = 1000 * 60 * 60 * 24 * 14;

const donation = {
	check(store) {
		const now = new Date().getTime();

		if (!store.state.pref.donateShown &&
			now > store.state.pref.firstRunTime + DONATION_DELAY) {
			setPref(store, 'donateShown', true);
			console.warn("app-donation check using mountTo");
			new donation.component().$mountTo(document.body);
		}
	},

	component: Vue.extend({
		template: require('./index.html'),

		computed: {
			pleaseDonate() {
				return locale.say(`If you love Twine as much as I do, please consider helping it grow with a donation. Twine is an open source project that will always be free to use &mdash; and with your help, Twine will continue to thrive.`);
			},
			shownOnce() {
				return locale.say(`This message will only be shown to you once.&lt;br&gt;If you'd like to donate to Twine development in the future, you can do so at &lt;a href=\"http:\/\/twinery.org/donate\" target=\"_blank\"&gt;http://twinery.org/donate&lt;/a&gt;.`);
			}
		},

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

module.exports = donation;
