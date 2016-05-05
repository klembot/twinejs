// This mixin helps sync a Backbone collection with a Vue instance. Vue detects
// a collection as an array, so non-array properties aren't sensed by it. This
// makes certain collection properties, listed below, reactive.
//
// This also aids with communication between a tree of components. A child
// component can signal to its parent that a model should be added or removed
// from a collection with `create, `add`, and `remove` events.
//
// In order to use this, you must set a `collection` prop or option.

function sortAdaptor() {
	this.modelOrder = this.$collection.order;
}

function changeAdaptor() {
	// We need to create a fresh copy of the array. We can't use toJSON()
	// because it will render the models as plain JS objects, and we need them
	// to remain Backbone model objects. And we can't do a straight assignment,
	// as that will not trigger reactive changes properly.

	this.models = this.$collection.models.slice();
}

module.exports = {
	data: () => ({
		models: [],
		modelOrder: ''
	}),

	events: {
		// A child component can ask us to create a new model in the collection
		// with the `collection-create` event.

		'collection-create'(props) {
			this.$collection.create(props);
		},

		// When a child component adds a new story, it notifies us via a
		// `collection-add` event.

		'collection-add'(model) {
			this.$collection.add(model);
		},
		
		// When a child component removes a story, it can likewise notify us.
		// Note that destroying a model will automatically update any
		// collections it belongs to, so dispatching this event isn't needed in
		// this case.

		'collection-remove'(model) {
			this.$collection.remove(model);
		}
	},

	init() {
		this.$collection = this.$options.collection;
	},

	created() {
		// If the collection wasn't set as an option, then try it as a prop.

		this.$collection = this.$collection || this.collection;

		if (this.$collection === undefined) {
			throw new Error("Neither a prop nor option named collection has been defined");
		}
	},

	compiled() {
		// Initially set the models and modelOrder properties up, so that we
		// have an initial values. See the comments above in changeAdaptor as
		// to why we have to use the spread operator here.

		this.modelOrder = this.$collection.order;
		this.models = this.$collection.models.slice();

		// Set up event listener bindings that we need down in beforeDestroy().

		this.$backboneCollectionAdaptors = {
			sort: sortAdaptor.bind(this),
			change: changeAdaptor.bind(this)
		};

		// Listen to collection events so that models and modelOrder stays in
		// sync as the collection changes.

		this.$collection.on('sort', this.$backboneCollectionAdaptors.sort);
		this.$collection.on(
			'update reset sort',
			this.$backboneCollectionAdaptors.change
		);
	},

	beforeDestroy() {
		this.$collection.off('sort', this.$backboneCollectionAdaptors.sort);
		this.$collection.off(
			'update reset sort',
			this.$backboneCollectionAdaptors.change
		);
	}
};

