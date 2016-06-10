// A mixin that gives each Vue instance a unique ID string,
// to be used as an event namespace for attaching and removing events.

const domEventSpecial = require('dom-event-special');
let maxID = 0;

module.exports = {
	eventID: {
		init() {
			// Check that this hasn't been applied more than once.
			if (!('$eventID' in this)) {
				Object.defineProperty(this, '$eventID', { value: '.instance' + maxID });
				maxID += 1;
			}
		}
	},
	// dom-event-special v0.1.7 has a bug: its methods won't work unless bound.
	on: domEventSpecial.on.bind(domEventSpecial),
	off: domEventSpecial.off.bind(domEventSpecial),
};
