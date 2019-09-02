/*
Manages modals with a single text input, a la window.prompt.
*/

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import modalDialog from '../../ui/modal-dialog';
import {say} from '../../locale';
import template from './index.html';
import './index.less';

/*
Shows a modal confirmation dialog, with one button (to continue the action)
and a Cancel button.

Options:
	- message, HTML HTML source of the message
	- modalClass, CSS class to apply to the modal
	- buttonClass, CSS class to apply to the action button
	- buttonLabel, HTML label for the button
*/

const confirmation = Vue.component('confirm', {
	template,
	props: {
		buttonLabel: {type: String, default: ''},
		modalClass: {type: String, default: ''},
		buttonClass: {type: String, default: 'primary'},
		coda: {type: String, default: ''},
		message: {type: String, default: ''}
	},
	data: () => ({
		cancelLabel: '<i class="fa fa-times"></i> ' + say('Cancel')
	}),
	methods: {
		accept() {
			eventHub.$emit('close', true);
			this.$emit('close', true);
		},

		cancel() {
			eventHub.$emit('close', false);
			this.$emit('close', true);
		}
	},
	components: {
		'modal-dialog': modalDialog
	}
});

export default {
	component: confirmation
};
