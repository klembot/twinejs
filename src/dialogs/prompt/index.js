/* Shows a modal dialog asking for a text response from the user. */

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import modalDialog from '../../ui/modal-dialog';
import {say} from '../../locale';
import template from './index.html';
import './index.less';

const prompter = {
	component: Vue.component('prompt', {
		template,
		props: {
			buttonLabel: {type: String, default: ''},
			buttonClass: {type: String, default: 'primary'},
			validator: {type: Function, default: function() {}},
			origin: {default: null},
			message: {type: String, default: ''},
			modalClass: {type: String, default: ''}
		},
		data: () => ({
			cancelLabel: '<i class="fa fa-times"></i> ' + say('Cancel'),
			validationError: null,
			response: null
		}),
		mounted() {
			this.$nextTick(function() {
				// code that assumes this.$el is in-document
				this.$refs.response.focus();
				this.$refs.response.select();
			});
		},
		methods: {
			accept() {
				const validResponse = this.validator(this.response);

				if (typeof validResponse === 'string') {
					this.validationError = validResponse;
				} else {
					eventHub.$emit('close', false, this.response);
				}
			},
			cancel() {
				eventHub.$emit('close', true, this.validationError);
			}
		},
		components: {
			'modal-dialog': modalDialog
		}
	})
};

export default prompter;
