import semverUtils from 'semver-utils';
import jsonp from '@/util/jsonp';
import {builtinFormats} from './defaults';

let loadFormatUrlQueue = Promise.resolve();

function loadFormatUrl(url) {
	/*
	We can only load one format at a time because they all use the same callback
	name. If we run in parallel, requests will collide with each other. The
	multiple promises are necessary for callers to see the final resolution
	properly.
	*/

	return new Promise((resolve, reject) => {
		loadFormatUrlQueue = loadFormatUrlQueue.then(
			() =>
				new Promise(resolveQueue => {
					jsonp(url, {name: 'storyFormat', timeout: 2000}, (err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}

						resolveQueue();
					});
				})
		);
	});
}

export function createFormat({commit}, {storyFormatProps}) {
	commit('createFormat', {storyFormatProps});
}

export async function createFormatFromUrl({commit, state}, {storyFormatUrl}) {
	/*
	Try loading the format, and only if that succeeds, create it.
	*/
	try {
		const data = await loadFormatUrl(storyFormatUrl);

		if (!data.name || !data.version) {
			commit(
				'setCreateFormatFromUrlError',
				new Error(
					'This story format does not have a name and version property.'
				)
			);
		}

		if (!data.source) {
			commit(
				'setCreateFormatFromUrlError',
				new Error('This story format does not have a source property.')
			);
		}

		const pVer = semverUtils.parse(data.version);
		const pMinor = parseInt(pVer.minor);
		const pPatch = parseInt(pVer.patch);

		/*
		Check for an identical version.
		*/

		if (
			state.formats.some(f => f.name === f.name && f.version === data.version)
		) {
			commit(
				'setCreateFormatFromUrlError',
				new Error('This story format is already installed.')
			);
			return;
		}

		/*
		Check for a more recent version.
		*/

		if (
			state.formats.some(f => {
				const fVer = semverUtils.parse(f.version);

				return (
					f.name === data.name &&
					fVer.major === pVer.major &&
					parseInt(fVer.minor) >= pMinor &&
					parseInt(fVer.patch) >= pPatch
				);
			})
		) {
			commit(
				'setCreateFormatFromUrlError',
				new Error(
					'A more recent version of this story format is already installed.'
				)
			);
			return;
		}

		createFormat(
			{commit},
			{
				storyFormatProps: {
					name: data.name,
					version: data.version,
					loadError: null,
					loading: false,
					url: storyFormatUrl,
					userAdded: true,
					properties: data
				}
			}
		);
	} catch (err) {
		commit(
			'setCreateFormatFromUrlError',
			new Error(`Could not load URL: ${err.message}`)
		);
	}
}

export function deleteFormat({commit}, {storyFormatId}) {
	commit('deleteFormat', {storyFormatId});
}

export async function loadFormat({commit, state}, {force, storyFormatId}) {
	const format = state.formats.find(f => f.id === storyFormatId);

	if ((format.loadError || format.loading) && !force) {
		return;
	}

	commit('updateFormat', {
		storyFormatProps: {
			loading: true,
			loadError: null
		},
		storyFormatId: format.id
	});

	try {
		const properties = await loadFormatUrl(
			format.userAdded ? '' : process.env.BASE_URL + format.url
		);

		commit('updateFormat', {
			storyFormatProps: {
				properties,
				loading: false,
				loadError: null
			},
			storyFormatId: format.id
		});

		/*
		Story formats may provide a setup() property that is run after load.
		*/

		if (properties.setup) {
			properties.setup.call(format);
		}
	} catch (loadError) {
		console.log(loadError);

		commit('updateFormat', {
			storyFormatProps: {loadError, loading: false, properties: null},
			storyFormatId: format.id
		});
	}
}

export async function loadAllFormats(store) {
	const {state} = store;
	const toLoad = state.formats.filter(
		f => !f.loadError && !f.loading && !f.properties
	);

	if (!toLoad) {
		return;
	}

	await Promise.allSettled(
		toLoad.map(f => loadFormat(store, {storyFormatId: f.id}))
	);
}

export function repairFormats({commit, state}) {
	/*
	Delete unversioned formats.
	*/

	state.formats.forEach(format => {
		if (typeof format.version !== 'string' || format.version === '') {
			console.warn(`Deleting unversioned story format ${format.name}`);
			commit('deleteFormat', {storyFormatId: format.id});
		}
	});

	/*
	Create built-in story formats if they don't already exist.
	*/

	builtinFormats.forEach(builtin => {
		if (
			!state.formats.find(
				format =>
					format.name === builtin.name && format.version === builtin.version
			)
		) {
			// eslint-disable-next-line no-console
			console.info(
				`Builtin format ${builtin.name} ${builtin.version} does not exist, creating`
			);
			commit('createFormat', {storyFormatProps: builtin});
		}
	});

	/*
	Delete any outdated formats.
	*/

	// TODO

	// const latestVersions = latestFormatVersions(store);

	// state.storyFormat.formats.forEach(format => {
	// 	if (!format.version) {
	// 		return;
	// 	}

	// 	const v = semverUtils.parse(format.version);

	// 	if (v.semver !== latestVersions[format.name][v.major].semver) {
	// 		console.warn(`Deleting outdated story format ${format.name} ${v.semver}`);
	// 		deleteFormat(store, format.id);
	// 	}
	// });

	/*
	Bring format preferences in line with the latest of its major version
	series.
	*/

	// TODO

	// const defaultFormat = store.state.pref.defaultFormat || {
	// 	name: null,
	// 	version: null
	// };
	// const defaultFormatVersion = semverUtils.parse(defaultFormat.version);
	// const latestDefault = latestVersions[defaultFormat.name];
	// const proofingFormat = store.state.pref.proofingFormat || {
	// 	name: null,
	// 	version: null
	// };
	// const proofingFormatVersion = semverUtils.parse(proofingFormat.version);
	// const latestProofing = latestVersions[proofingFormat.name];

	// if (latestDefault && latestDefault[defaultFormatVersion.major]) {
	// 	setPref(store, 'defaultFormat', {
	// 		name: defaultFormat.name,
	// 		version: latestDefault[defaultFormatVersion.major].semver
	// 	});
	// }

	// if (latestProofing && latestProofing[proofingFormatVersion.major]) {
	// 	setPref(store, 'proofingFormat', {
	// 		name: proofingFormat.name,
	// 		version: latestProofing[proofingFormatVersion.major].semver
	// 	});
	// }
}

export function updateFormat({commit}, {storyFormatId, storyFormatProps}) {
	commit('update', {storyFormatId, storyFormatProps});
}
