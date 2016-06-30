// Functions for moving prefs in and out of local storage.

const uuid = require('tiny-uuid');
const { setPref } = require('../actions');

module.exports = {
	save(store) {
		// Delete existing prefs in local storage, since we aren't bothering to
		// preserve ids.

		window.localStorage.getItem('twine-prefs').split(',').forEach(id => {
			window.localStorage.removeItem('twine-prefs-' + id);
		});

		// Save new ones.

		let ids = [];

		Object.keys(store.state.pref).forEach(name => {
			const id = uuid();

			ids.push(id);
			window.localStorage.setItem(
				'twine-prefs-' + id,
				JSON.stringify({
					id,
					name,
					value: store.state.pref[name]
				})
			);
		});

		window.localStorage.setItem('twine-prefs', ids.join(','));
	},

	load(store) {
		window.localStorage.getItem('twine-prefs').split(',').forEach(id => {
			try {
				const item = JSON.parse(
					window.localStorage.getItem('twine-prefs-' + id)
				);

				setPref(store, item.name, item.value);
			}
			catch(e) {
				console.log(
					'Preference ${id} had corrupt serialized value, skipping',
					window.localStorage.getItem('twine-prefs-' + id)
				);
			}
		});
	}
};
