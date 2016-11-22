/*
Vuex actions that components can use.
*/

const $ = require('jquery');
const semverUtils = require('semver-utils');
const linkParser = require('./link-parser');
const locale = require('../locale');
const rect = require('../common/rect');

const actions = module.exports = {
	setPref({ dispatch }, name, value) {
		dispatch('UPDATE_PREF', name, value);
	},

	createStory(store, props) {
		let normalizedProps = Object.assign({}, props);

		/* If a format isn't specified, use the default one. */

		if (!normalizedProps.storyFormat) {
			normalizedProps.storyFormat = store.state.pref.defaultFormat.name;
			normalizedProps.storyFormatVersion =
				store.state.pref.defaultFormat.version;
		}

		store.dispatch('CREATE_STORY', normalizedProps);
	},

	updateStory({ dispatch }, id, props) {
		dispatch('UPDATE_STORY', id, props);
	},

	deleteStory({ dispatch }, id) {
		dispatch('DELETE_STORY', id);
	},

	duplicateStory({ dispatch }, id, newName) {
		dispatch('DUPLICATE_STORY', id, newName);
	},

	importStory({ dispatch }, toImport) {
		dispatch('IMPORT_STORY', toImport);
	},

	createPassageInStory({ dispatch }, storyId, props) {
		dispatch('CREATE_PASSAGE_IN_STORY', storyId, props);
	},

	updatePassageInStory({ dispatch }, storyId, passageId, props) {
		dispatch('UPDATE_PASSAGE_IN_STORY', storyId, passageId, props);
	},

	deletePassageInStory({ dispatch }, storyId, passageId) {
		dispatch('DELETE_PASSAGE_IN_STORY', storyId, passageId);
	},

	/*
	Moves a passage so it doesn't overlap any other in its story, and also
	snaps to a grid.
	*/

	positionPassage(store, storyId, passageId, gridSize, filter) {
		const story = store.state.story.stories.find(
			story => story.id == storyId
		);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		const passage = story.passages.find(
			passage => passage.id == passageId
		);

		if (!passage) {
			throw new Error(
				`No passage exists in this story with id ${passageId}`
			);
		}

		/* Displace by other passages. */

		let passageRect = {
			top: passage.top,
			left: passage.left,
			width: passage.width,
			height: passage.height
		};

		story.passages.forEach(other => {
			if (other === passage || (filter && !filter(other))) {
				return;
			}

			const otherRect = {
				top: other.top,
				left: other.left,
				width: other.width,
				height: other.height
			};

			if (rect.intersects(otherRect, passageRect)) {
				rect.displace(passageRect, otherRect, 10);
			}
		});

		/* Snap to the grid. */

		if (story.snapToGrid && gridSize !== 0) {
			passageRect.left = Math.round(passageRect.left / gridSize) *
				gridSize;
			passageRect.top = Math.round(passageRect.top / gridSize) *
				gridSize;
		}

		/* Save the change. */

		actions.updatePassageInStory(
			store,
			storyId,
			passageId,
			{
				top: passageRect.top,
				left: passageRect.left
			}
		);
	},

	/*
	Adds new passages to a story based on new links added in a passage's text.
	*/

	createNewlyLinkedPassages(store, storyId, passageId, oldText) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);
		const passage = story.passages.find(
			passage => passage.id === passageId
		);

		/* Determine how many passages we'll need to create. */

		const oldLinks = linkParser(oldText, true);
		const newLinks = linkParser(passage.text, true).filter(
			link => (oldLinks.indexOf(link) === -1) &&
				!(story.passages.some(passage => passage.name === link))
		);

		/* We center the new passages underneath this one. */

		const newTop = passage.top + 100 * 1.5;

		/*
		We account for the total width of the new passages as both the width of
		the passages themselves plus the spacing in between.
		*/

		const totalWidth = newLinks.length * 100 +
			((newLinks.length - 1) * (100 / 2));
		let newLeft = passage.left + (100 - totalWidth) / 2;

		newLinks.forEach(link => {
			store.dispatch(
				'CREATE_PASSAGE_IN_STORY',
				storyId,
				{
					name: link,
					left: newLeft,
					top: newTop
				}
			);

			newLeft += 100 * 1.5;
		});
	},

	/* Updates links to a passage in a story to a new name. */

	changeLinksInStory(store, storyId, oldName, newName) {
		// TODO: add hook for story formats to be more sophisticated

		const story = store.state.story.stories.find(story => story.id === storyId);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		/*
		Escape regular expression characters.
		Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
		*/

		const oldNameEscaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const newNameEscaped = newName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		const simpleLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const compoundLinkRe = new RegExp(
			'\\[\\[(.*?)(\\||->)' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const reverseLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(<-.*?)(\\]\\[.*?)?\\]\\]',
			'g'
		);

		story.passages.forEach(passage => {
			if (simpleLinkRe.test(passage.text) || compoundLinkRe.test(passage.text) ||
				reverseLinkRe.test(passage.text)) {
				let newText = passage.text;

				newText = newText.replace(
					simpleLinkRe,
					'[[' + newNameEscaped + '$1]]'
				);
				newText = newText.replace(
					compoundLinkRe,
					'[[$1$2' + newNameEscaped + '$3]]'
				);
				newText = newText.replace(
					reverseLinkRe,
					'[[' + newNameEscaped + '$1$2]]'
				);

				store.dispatch(
					'UPDATE_PASSAGE_IN_STORY',
					storyId, 
					passage.id,
					{ text: newText }
				);
			}
		});
	},

	createFormat({ dispatch }, props) {
		dispatch('CREATE_FORMAT', props);
	},

	updateFormat({ dispatch }, id, props) {
		dispatch('UPDATE_FORMAT', id, props);
	},

	deleteFormat({ dispatch }, id) {
		dispatch('DELETE_FORMAT', id);
	},

	createFormatFromUrl(store, url) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: url,
				dataType: 'jsonp',
				jsonpCallback: 'storyFormat',
				crossDomain: true
			})
			.done(props => {
				if (store.state.storyFormat.formats.some(
					format => format.name === props.name)) {
					reject(new Error(
						locale.say(
							'a story format named &ldquo;%s&rdquo; already exists',
							props.name
						)
					));
				}

				const format = {
					name: props.name,
					url,
					properties: props
				};

				store.dispatch('CREATE_FORMAT', format);
				resolve(format);
			})
			.fail((req, status, error) => {
				reject(error);
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
			format => format.name === name &&
				semverUtils.parse(format.version).major === majorVersion 
		);

		if (formats.length === 0) {
			throw new Error('No format is available named ' + name);
		}

		const format = formats.reduce((prev, current) => {
			const pVer = semverUtils.parse(prev.version);
			const cVer = semverUtils.parse(current.version);

			if (cVer.major === pVer.major && (parseInt(cVer.minor) >
				parseInt(pVer.minor) || parseInt(cVer.patch) >
				parseInt(pVer.minor))) {
				return current;
			}

			return previous;
		});

		if (!format) {
			throw new Error('No format is available for version ' + version);
		}

		return new Promise((resolve, reject) => {
			if (format.loaded) {
				resolve(format);
				return;
			}

			$.ajax({
				url: format.url,
				dataType: 'jsonp',
				jsonpCallback: 'storyFormat',
				crossDomain: true
			})
			.done(props => {
				store.dispatch('LOAD_FORMAT', format.id, props);
				resolve(format);
			})
			.fail((req, status, error) => {
				reject(error);
			});
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
				actions.deleteFormat(store, format.id);
			}
		});

		/*
		Create built-in story formats if they don't already exist.
		*/

		const builtinFormats = [
			{
				name: 'Harlowe',
				url: 'story-formats/harlowe-1.2.3/format.js',
				version: '1.2.3',
				userAdded: false
			},
			{
				name: 'Harlowe',
				url: 'story-formats/harlowe-2.0.0/format.js',
				version: '2.0.0',
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
				url: 'story-formats/snowman-1.3.0/format.js',
				version: '1.3.0',
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
				url: 'story-formats/sugarcube-2.11.0/format.js',
				version: '2.11.0',
				userAdded: false
			}
		];

		builtinFormats.forEach(builtin => {
			if (!store.state.storyFormat.formats.find(
				format => format.name === builtin.name &&
					format.version === builtin.version
			)) {
				actions.createFormat(store, builtin);
			}
		});

		/*
		Set default formats if not already set, or if an unversioned preference
		exists.
		*/

		if (typeof store.state.pref.defaultFormat !== 'object') {
			actions.setPref(
				store,
				'defaultFormat',
				{ name: 'Harlowe', version: '1.2.3' }
			);
		}

		if (typeof store.state.pref.proofingFormat !== 'object') {
			actions.setPref(
				store,
				'proofingFormat',
				{ name: 'Paperthin', version: '1.0.0' }
			);
		}
	},

	/*
	Repairs stories by ensuring that they always have a story format and
	version set.
	*/

	repairStories(store) {
		store.state.story.stories.forEach(story => {
			/*
			Reset stories without any story format.
			*/

			if (!story.storyFormat) {
				actions.updateStory(
					store,
					story.id,
					{ storyFormat: store.state.pref.defaultFormat.name }
				);
			}
			
			/*
			Coerce old SugarCube formats, which had version numbers in their
			name, to the correct built-in ones.
			*/

			if (/^SugarCube 1/.test(story.storyFormat)) {
				actions.updateStory(
					store,
					story.id,
					{ storyFormat: 'SugarCube', storyFormatVersion: '1.0.35' }
				);
			}
			else if (/^SugarCube 2/.test(story.storyFormat)) {
				actions.updateStory(
					store,
					story.id,
					{ storyFormat: 'SugarCube', storyFormatVersion: '2.11.0' }
				);
			}
			else if (!story.storyFormatVersion) {
				/*
				If a story has no format version, pick the lowest version number
				currently available.
				*/

				const format = store.state.storyFormat.formats.reduce((prev, current) => {
					if (current.name !== story.storyFormat) {
						return prev;
					}

					const pVer = semverUtils.parse(prev.version);
					const cVer = semverUtils.parse(current.version);

					if (parseInt(cVer.major) < parseInt(pVer.major) ||
						parseInt(cVer.minor) < parseInt(pVer.minor) ||
						parseInt(cVer.patch) < parseInt(pVer.patch)) {
						return current;
					}

					return prev;
				});

				if (format) {
					actions.updateStory(
						store,
						story.id,
						{ storyFormatVersion: format.version }
					);
				}
			}
		});
	}
};
