/*
Shows a dialog asking the user to make a donation.
*/

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import modalDialog from '../../ui/modal-dialog';
import {say} from '../../locale';
import {setPref} from '../../data/actions/pref';
import template from './index.html';
import './index.less';

export const component = Vue.component('app-donation', {
	template,
	computed: {
		pleaseDonate() {
			return say(
				`If you love Twine as much as I do, please consider helping it grow with a donation. Twine is an open source project that will always be free to use &mdash; and with your help, Twine will continue to thrive.`
			);
		},
		shownOnce() {
			return say(
				`This message will only be shown to you once.<br>If you'd like to donate to Twine development in the future, you can do so at <a href=\'http://twinery.org/donate\' target=\'_blank\'>http://twinery.org/donate</a>.`
			);
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
		'modal-dialog': modalDialog
	}
});

/*
How long we wait after the user first starts using Twine to show a message
asking for a donation, in milliseconds. This is currently 14 days.
*/

const DONATION_DELAY = 1000 * 60 * 60 * 24 * 14;

export function check(store) {
	const now = new Date().getTime();

	if (
		!store.state.pref.donateShown &&
		now > store.state.pref.firstRunTime + DONATION_DELAY
	) {
		setPref(store, 'donateShown', true);
		eventHub.$emit('customModal', component);
		return true;
	}
	return false;
}
