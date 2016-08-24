// A mixin that gives each Vue instance a unique ID string,
// to be used as an event namespace for attaching and removing events.

const domEventSpecial = require('dom-event-special');
let maxID = 0;
// Holds every element which had an event handler attached, so that
// beforeDestroy() can remove them. Each property is an instance's eventID,
// and the value is a Set of elements.
const elements = {};

module.exports = {
	eventID: {
		init() {
			// Check that this hasn't been applied more than once.
			if (!('$eventID' in this)) {
				Object.defineProperty(this,
					'$eventID', { value: '.instance' + maxID }
				);
				maxID += 1;
				elements[this.$eventID] = new Set();
			}
		},
		beforeDestroy() {
			elements[this.$eventID].forEach(
				element => domEventSpecial.off(element, this.$eventID)
			);
			delete elements[this.$eventID];
		},
	},

	on(element, selector, handler) {
		domEventSpecial.on(element, selector, handler);
		// This should usually have an EventID selector (one that begins with
		// ".instance") and thus the element should be stored.
		const eventID = selector.split('.')
			.find(e => e.indexOf('instance') === 0);
		if (eventID) {
			elements["." + eventID].add(element);
		}
	},

	off: domEventSpecial.off.bind(domEventSpecial),
};
