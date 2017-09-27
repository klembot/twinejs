/* Functions for moving story formats in and out of local storage. */

const uuid = require('tiny-uuid');
const { createFormat } = require('../actions/story-format');

module.exports = {
	save(store) {
		/*
		Delete existing formats in local storage, since we aren't bothering to
		preserve ids.
		*/

		const previouslySerialized =
			window.localStorage.getItem('twine-storyformats');

		if (previouslySerialized) {
			previouslySerialized.split(',').forEach(id => {
				window.localStorage.removeItem('twine-storyformats-' + id);
			});
		}

		/* Save new ones. */

		let ids = [];

		store.state.storyFormat.formats.forEach(format => {
			const id = uuid();

			/*
			We have to remove the `properties` property if it exists, as that
			is dynamically added when loading.
			*/

			ids.push(id);
			window.localStorage.setItem(
				'twine-storyformats-' + id,
				JSON.stringify(
					Object.assign({}, format, { properties: undefined })
				)
			);
		});

		window.localStorage.setItem('twine-storyformats', ids.join(','));
	},

	load(store) {
		const serialized = window.localStorage.getItem('twine-storyformats');

		if (!serialized) {
			return;
		}

		serialized.split(',').forEach(id => {
			try {
				const item = JSON.parse(
					window.localStorage.getItem('twine-storyformats-' + id)
				);

				createFormat(store, item);
			}
			catch (e) {
				console.warn(
					`Story format ${id} had corrupt serialized value, skipping`,
					window.localStorage.getItem('twine-storyformats-' + id)
				);
			}
		});
	}
};
