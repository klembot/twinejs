/*
This helps Vue components listen to DOM events outside their element. Sometimes
an event listener needs to be attached to the <body> element, for example.
Using this mixin, the component does not need to hold onto a reference to the
listeners and manually remove them.
*/

const domEventSpecial = require('dom-event-special');
const uuid = require('tiny-uuid');

/* A list of all namespaces, indexed by the component. */
let eventNamespaces = {};

/* A list of all elements that have been listened to, indexed by component. */
let attachedEls = {};

module.exports = {
	init() {
		/*
		This is an arbitrary name -- we just need the prefix to ensure it
		doesn't start with a number.
		*/

		eventNamespaces[this] = '.e-' + uuid();

		/* We use a set here to ensure that it contains unique values. */

		if (!attachedEls[this]) { 
			attachedEls[this] = new Set();
		}
	},

	beforeDestroy() {
		/* Clean up event listeners that have been previously attached. */

		if (!attachedEls[this]) {
			return;
		}

		attachedEls[this].forEach(
			el => domEventSpecial.off(el, eventNamespaces[this])
		);
	},

	methods: {
		/*
		Adds an event listener. Note that unlike jQuery, you may only listen to
		a single event type per method call, and this automatically binds
		handlers to the component.
		*/

		on(element, event, handler) {
			attachedEls[this].add(element);
			domEventSpecial.on(element, event + eventNamespaces[this], handler.bind(this));
		},

		/*
		Removes an event listener type.

		We don't need to do anything special; if we have extraneous entries in
		attachedEls, it's harmless.  
		*/

		off(element, event) {
			domEventSpecial.off(element, event + eventNamespaces[this]);
		}
	}
};
