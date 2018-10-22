/* Shows a modal dialog asking for a text response from the user. */

const Vue = require('vue');

const locale = require('../../locale');
const eventHub = require('../../common/eventHub');
const { thenable } = require('../../vue/mixins/thenable');

require('./index.less');

const prompter = {
	component: Vue.component('prompt', {
		template: require('./index.html'),

		props: ['promptButtonLabel', 'promptButtonClass', 'promptValidator', 'promptOrigin', 'promptMessage', 'promptResponse'],

		data: () => ({
			message: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			buttonClass: 'primary',
			modalClass: '',
			isValid: true,
			validationError: '',
			validator: function() {},
			origin: null
		}),

		mounted() {
			this.$nextTick(function () {
				// code that assumes this.$el is in-document
				this.$refs.promptResponse.focus();
				this.$refs.promptResponse.select();
			});
		},

		methods: {
			accept() {
				const validResponse = this.promptValidator(this.promptResponse);

				if (typeof validResponse === 'string') {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					eventHub.$emit('close', this.promptResponse);
				}
			},

			cancel() {
				eventHub.$emit('close');
			}
		},

		components: {
			'modal-dialog': require('../../ui/modal-dialog')
		},

		mixins: [thenable]
	}),
};

module.exports = prompter;
