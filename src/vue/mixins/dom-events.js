/*
This helps Vue components listen to DOM events outside their el. Sometimes
an event listener needs to be attached to the <body> el, for example.
Using this mixin, the component does not need to hold onto a reference to the
listeners and manually remove them.
*/

/*
A list of all event listeners, indexed by the component. Each entry is an array
of objects with event, el, and listener properties.
*/
let listeners = {};

module.exports = {
	created() {
		this.$domEventKey = Symbol();

		if (!listeners[this.$domEventKey]) {
			listeners[this.$domEventKey] = [];
		}
	},

	beforeDestroy() {
		/* Clean up event listeners that have been previously attached. */

		if (!listeners[this.$domEventKey]) {
			return;
		}

		listeners[this.$domEventKey].forEach(
			props => props.el.removeEventListener(props.event, props.listener)
		);

		listeners[this.$domEventKey] = null;
	},

	methods: {
		/*
		Adds an event listener. Note that unlike jQuery, you may only listen to
		a single event type per method call, and this automatically binds
		handlers to the component.
		*/

		on(el, event, listener, options) {
			const boundListener = listener.bind(this);

			el.addEventListener(event, boundListener, options);
			listeners[this.$domEventKey].push(
				{ el, event, options, listener: boundListener }
			);
		},

		/*
		Removes all listeners for an event type.
		*/

		off(el, event) {
			if (!listeners[this.$domEventKey]) {
				return;
			}

			listeners[this.$domEventKey] =
				listeners[this.$domEventKey].filter(props => {
					if (props.event === event) {
						props.el.removeEventListener(
							props.event, props.listener, props.options
						);
						return false;
					}

					return true;
				});
		}
	}
};
