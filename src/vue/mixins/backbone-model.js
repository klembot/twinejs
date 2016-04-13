// This mixin links data properties to a Backbone model instance. The model
// has to be set as an Vue option, and will be made available to the
// instance as `$model` (though this is a just-in-case feature -- normally, you
// will want to access it via the data properties).
//
// You must also declare the model attributes you're interested in by adding
// data properties matching their names.
// 
// The concept for this is taken from http://jsfiddle.net/x1jeawzv/2/.

function backboneAdaptor(model) {
	Object.keys(model.changedAttributes()).forEach(
		(key) => {
			if (this[key] !== undefined) {
				this[key] = model.get(key);
			}
		}
	);
}

module.exports = {
	init() {
		this.$model = this.$options.model;
	},

	created() {
		// Set up two-way bindings.

		const modelJSON = this.$model.toJSON();

		Object.keys(modelJSON).forEach((key) => {
			if (this[key] !== undefined) {
				// Set the initial value.

				this[key] = modelJSON[key];

				// When the Vue model has changed, update the Backbone one.

				this.$watch(key, (value) => {
					this.$model.save(key, value);
				});
			}
		});

		// Set up the Backbone -> Vue connection.

		this.$backboneModelAdaptor = backboneAdaptor.bind(this);
		this.$model.on('change', this.$backboneModelAdaptor);
	},

	destroyed() {
		this.model.off('change', this.$backboneModelAdaptor);
	}
};

