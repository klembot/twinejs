/*
A generic modal dialog component. This implements the Thenable mixin and
resolves itself when it is closed.
*/

const Vue = require('vue');
const domEvents = require('../../vue/mixins/dom-events');
const { thenable, symbols: { reject, resolve } } =
	require('../../vue/mixins/thenable');

const ModalDialog = module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		class: '',
		title: '',
		origin: null,
		canClose: {
			type: Function,
			required: false
		}
	},

	ready() {
		const dialog = this.$el.querySelector('.modal-dialog');

		/*
		If an origin is specified, set it as the point the modal dialog grows
		out of.
		*/

		if (this.origin) {
			const originRect = this.origin.getBoundingClientRect();
			dialog.style.transformOrigin =
				(originRect.left + originRect.width / 2) + 'px ' +
				(originRect.top + originRect.height / 2) + 'px';
		}

		let body = document.querySelector('body');

		body.classList.add('modalOpen');
		this.on(body, 'keyup', this.escapeCloser);

		/*
		We have to listen manually to the end of the transition in order to an
		emit an event when this occurs; it looks like Vue only consults the
		top-level element to see when the transition is complete.
		*/

		const notifier = () => {
			/*
			This event is currently only listened to by <code-mirror> child
			components.
			*/
			this.$broadcast('transition-entered');
			dialog.removeEventListener('animationend', notifier);
		};

		dialog.addEventListener('animationend', notifier);
	},

	destroyed() {
		let body = document.querySelector('body');

		body.classList.remove('modalOpen');
		this.$emit('destroyed');
	},

	methods: {
		close(message) {
			if (typeof this.canClose === 'function' && !this.canClose()) {
				return;
			}

			this.$emit('close', message);
		},

		escapeCloser(e) {
			if (e.keyCode === 27) {
				e.preventDefault();
				this.close();
			}
		}
	},

	events: {
		close(message) {
			this[resolve](message);
			this.$destroy(true);
		},

		reject(message) {
			this[reject](message);
			this.$destroy(true);
		}
	},

	mixins: [domEvents, thenable]
});

/*
We have to transition in our individual parts through a custom transition.
*/

ModalDialog.transition('modal-dialog', {
	beforeEnter: function(el) {
		let overlay = el.querySelector('#modal-overlay');
		let dialog = el.querySelector('.modal-dialog');

		overlay.classList.add('fade-in-out-transition', 'fade-in-out-enter');
		dialog.classList.add('grow-in-out-enter');

		dialog.addEventListener('animationend', function() {
			dialog.classList.remove('grow-in-out-enter');
		});
	},

	enter: function(el, done) {
		let overlay = el.querySelector('#modal-overlay');
		let dialog = el.querySelector('.modal-dialog');

		Vue.nextTick(() => {
			overlay.classList.remove('fade-in-out-enter');
			overlay.addEventListener('transitionend', done);
		});
	},

	leave: function(el, done) {
		let overlay = el.querySelector('#modal-overlay');
		let dialog = el.querySelector('.modal-dialog');

		dialog.classList.add('grow-in-out-leave');
		overlay.classList.add('fade-in-out-leave');
		overlay.addEventListener('transitionend', done);
	}
});
