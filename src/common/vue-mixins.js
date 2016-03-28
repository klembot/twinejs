'use strict';
const Symbol = (window.Symbol || Math.random);

// These are symbols that key to "private" component methods.
const symbols = {
	resolve: Symbol(),
	reject: Symbol(),
};

module.exports = {
	// "thenable" makes a component usable as a Promise:
	// you can call .then() and .catch() on then to perform actions,
	// and perform them when the component is "done", using this.promise.resolve(),
	thenable: {
		init() {
			const promise = new Promise((resolve, reject) => {
				// These methods should be private (to the instance), but
				// the only easy way to approximate this is to key these methods to
				// symbols and force consumers to use those symbols.
				this[symbols.reject] = reject;
				this[symbols.resolve] = resolve;
			});
			this.then = promise.then.bind(promise);
			this.catch = promise.catch.bind(promise);
		},
	},
	symbols,
};
