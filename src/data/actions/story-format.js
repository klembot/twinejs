/*
Story format-related actions.
*/

const jsonp = require('../jsonp');
const semverUtils = require('semver-utils');
const latestFormatVersions = require('../latest-format-versions');
const locale = require('../../locale');
const {setPref} = require('./pref');

const actions = (module.exports = {
	createFormat({dispatch}, props) {
		dispatch('CREATE_FORMAT', props);
	},

	updateFormat({dispatch}, id, props) {
		dispatch('UPDATE_FORMAT', id, props);
	},

	deleteFormat({dispatch}, id) {
		dispatch('DELETE_FORMAT', id);
	},

	createFormatFromUrl(store, url) {
		return new Promise((resolve, reject) => {
			jsonp(url, {name: 'storyFormat', timeout: 2000}, (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				const pVer = semverUtils.parse(data.version);
				const pMinor = parseInt(pVer.minor);
				const pPatch = parseInt(pVer.patch);

				/*
					Check for an identical version.
					*/

				if (
					store.state.storyFormat.formats.some(current => {
						return (
							current.name === data.name &&
							current.version === data.version
						);
					})
				) {
					reject(
						new Error(
							locale.say('this story format is already installed')
						)
					);
					return;
				}

				/*
					Check for a more recent version.
					*/

				if (
					store.state.storyFormat.formats.some(current => {
						const cVer = semverUtils.parse(current.version);

						return (
							current.name === data.name &&
							cVer.major === pVer.major &&
							parseInt(cVer.minor) >= pMinor &&
							parseInt(cVer.patch) >= pPatch
						);
					})
				) {
					reject(
						new Error(
							locale.say(
								'a more recent version of the story format &ldquo;%s&rdquo; is already installed',
								data.name
							)
						)
					);
					return;
				}

				const format = {
					name: data.name,
					version: data.version,
					url,
					userAdded: true,
					properties: data
				};

				store.dispatch('CREATE_FORMAT', format);
				resolve(format);
			});
		});
	},

	loadFormat(store, name, version) {
		/*
		We pick the highest version that matches the major version of the
		string (e.g. if we ask for version 2.0.8, we may get 2.6.1).
		*/

		const majorVersion = semverUtils.parse(version).major;
		const formats = store.state.storyFormat.formats.filter(
			format =>
				format.name === name &&
				semverUtils.parse(format.version).major === majorVersion
		);

		if (formats.length === 0) {
			throw new Error('No format is available named ' + name);
		}

		const format = formats.reduce((prev, current) => {
			const pVer = semverUtils.parse(prev.version);
			const pMinor = parseInt(pVer.minor);
			const pPatch = parseInt(pVer.patch);
			const cVer = semverUtils.parse(current.version);
			const cMinor = parseInt(cVer.minor);
			const cPatch = parseInt(cVer.patch);

			if (cMinor <= pMinor && cPatch <= pPatch) {
				return prev;
			}

			return current;
		});

		if (!format) {
			throw new Error('No format is available for version ' + version);
		}

		return new Promise((resolve, reject) => {
			if (format.loaded) {
				resolve(format);
				return;
			}

			jsonp(
				format.url,
				{name: 'storyFormat', timeout: 2000},
				(err, data) => {
					if (err) {
						reject(err);
						return;
					}

					store.dispatch('LOAD_FORMAT', format.id, data);
					resolve(format);
				}
			);
		});
	},

	/*
	Create built-in formats, repair paths to use kebab case (in previous
	versions we used camel case), and set version numbers.
	*/

	repairFormats(store) {
		/*
		Delete unversioned formats.
		*/

		store.state.storyFormat.formats.forEach(format => {
			if (typeof format.version !== 'string' || format.version === '') {
				console.warn(
					`Deleting unversioned story format ${format.name}`
				);
				actions.deleteFormat(store, format.id);
			}
		});

		/*
		Create built-in story formats if they don't already exist.
		*/

		const builtinFormats = [
			{
				name: 'Chapbook',
				url: 'story-formats/chapbook-1.2.1/format.js',
				version: '1.2.1',
				userAdded: false
			},
			{
				name: 'Harlowe',
				url: 'story-formats/harlowe-1.2.4/format.js',
				version: '1.2.4',
				userAdded: false
			},
			{
				name: 'Harlowe',
				url: 'story-formats/harlowe-2.1.0/format.js',
				version: '2.1.0',
				userAdded: false
			},
			{
				name: 'Harlowe',
				url: 'story-formats/harlowe-3.2.1/format.js',
				version: '3.2.1',
				userAdded: false
			},
			{
				name: 'Paperthin',
				url: 'story-formats/paperthin-1.0.0/format.js',
				version: '1.0.0',
				userAdded: false
			},
			{
				name: 'Snowman',
				url: 'story-formats/snowman-1.4.0/format.js',
				version: '1.4.0',
				userAdded: false
			},
			{
				name: 'Snowman',
				url: 'story-formats/snowman-2.0.2/format.js',
				version: '2.0.2',
				userAdded: false
			},
			{
				name: 'SugarCube',
				url: 'story-formats/sugarcube-1.0.35/format.js',
				version: '1.0.35',
				userAdded: false
			},
			{
				name: 'SugarCube',
				url: 'story-formats/sugarcube-2.34.1/format.js',
				version: '2.34.1',
				userAdded: false
			}
		];

		builtinFormats.forEach(builtin => {
			if (
				!store.state.storyFormat.formats.find(
					format =>
						format.name === builtin.name &&
						format.version === builtin.version
				)
			) {
				actions.createFormat(store, builtin);
			}
		});

		/*
		Set default formats if not already set, or if an unversioned preference
		exists.
		*/

		if (typeof store.state.pref.defaultFormat !== 'object') {
			setPref(store, 'defaultFormat', {
				name: 'Harlowe',
				version: '3.2.1'
			});
		}

		if (typeof store.state.pref.proofingFormat !== 'object') {
			setPref(store, 'proofingFormat', {
				name: 'Paperthin',
				version: '1.0.0'
			});
		}

		/*
		Delete any outdated formats.
		*/

		const latestVersions = latestFormatVersions(store);

		store.state.storyFormat.formats.forEach(format => {
			if (!format.version) {
				return;
			}

			const v = semverUtils.parse(format.version);

			if (v.semver !== latestVersions[format.name][v.major].semver) {
				console.warn(
					`Deleting outdated story format ${format.name} ${v.semver}`
				);
				actions.deleteFormat(store, format.id);
			}
		});

		/*
		Bring format preferences in line with the latest of its major version
		series.
		*/

		const defaultFormat = store.state.pref.defaultFormat || {
			name: null,
			version: null
		};
		const defaultFormatVersion = semverUtils.parse(defaultFormat.version);
		const latestDefault = latestVersions[defaultFormat.name];
		const proofingFormat = store.state.pref.proofingFormat || {
			name: null,
			version: null
		};
		const proofingFormatVersion = semverUtils.parse(proofingFormat.version);
		const latestProofing = latestVersions[proofingFormat.name];

		if (latestDefault && latestDefault[defaultFormatVersion.major]) {
			setPref(store, 'defaultFormat', {
				name: defaultFormat.name,
				version: latestDefault[defaultFormatVersion.major].semver
			});
		}

		if (latestProofing && latestProofing[proofingFormatVersion.major]) {
			setPref(store, 'proofingFormat', {
				name: proofingFormat.name,
				version: latestProofing[proofingFormatVersion.major].semver
			});
		}
	}
});
