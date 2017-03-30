// A mixin that offers a convenience method for mounting a component to a given
// element.

module.exports = {
	methods: {
		$mountTo(el) {
			const mountPoint = document.createElement('div');

			this.$mount(mountPoint).$appendTo(el);
			return this;
		},
	}
};

