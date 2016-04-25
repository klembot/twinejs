// This mixin helps sync a Backbone collection with a Vue instance. Vue detects
// a collection as an array, so non-array properties aren't sensed by it. This
// makes certain collection properties, listed below, reactive.
//
// This also aids with communication between a tree of components. A child
// component can signal to its parent that a model should be added or removed
// from a collection with `create, `add`, and `remove` events.
//
// In order to use this, you must set a `collection` prop or data object.

function sortAdaptor() {
	this.collectionOrder = this.collection.order;
}

module.exports = {
	data: () => ({
		collectionOrder: ''
	}),

	events: {
		// A child component can ask us to create a new model in the collection
		// with the `create` event.

		create(props) {
			this.collection.create(props);
		},

		// When a child component adds a new story, it notifies us via an `add`
		// event.

		add(model) {
			this.collection.add(model);
		},
		
		// When a child component removes a story, it can likewise notify us.
		// Note that destroying a model will automatically update any
		// collections it belongs to, so dispatching this event isn't needed in
		// this case.

		remove(model) {
			this.collection.remove(model);
		}
	},

	compiled() {
		this.collectionOrder = this.collection.order;
		this.$backboneSortAdaptor = sortAdaptor.bind(this);
		this.collection.on('sort', this.$backboneSortAdaptor);
	},

	destroyed() {
		this.collection.off('sort', this.$backboneSortAdaptor);
	}
};

