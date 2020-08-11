import {passageDefaults, storyDefaults} from '../defaults';

export function repairStories({commit, rootState, state}) {
	state.stories.forEach(story => {
		const storyFixes = Object.keys(storyDefaults).reduce(
			(result, defaultName) => {
				if (typeof story[defaultName] !== typeof storyDefaults[defaultName]) {
					/*
					If the default is an object, we need to copy it so stories
					remain separate.
					*/

					if (typeof storyDefaults[name] === 'object') {
						result[defaultName] = {...storyDefaults[defaultName]};
					} else {
						result[defaultName] = storyDefaults[defaultName];
					}
				}

				return result;
			},
			{}
		);

		/*
		Set the default story format. This will be an empty string at worst
		because of defaults being applied above.
		*/

		if (story.storyFormat === '' || story.storyFormatVersion === '') {
			console.warn(`Setting default story format on story ID ${story.id}`);
			commit('updateStory', {
				storyId: story.id,
				storyProps: {
					storyFormat: rootState.pref.storyFormat.name,
					storyFormatVersion: rootState.pref.storyFormat.version
				}
			});
		}

		if (Object.keys(storyFixes).length !== 0) {
			console.warn(
				`Fixing story properties of story ID ${story.id}`,
				storyFixes
			);
			commit('updateStory', {storyId: story.id, storyProps: storyFixes});
		}

		/*
		If the starting passage doesn't exist, repair that.
		*/

		if (
			story.passages.length > 0 &&
			!story.passages.some(p => p.id === story.startPassage)
		) {
			console.warn(
				`Story ID ${story.id} has bad start passage ID (${story.startPassage}), resetting to first one`
			);

			commit('updateStory', {
				storyId: story.id,
				storyProps: {startPassage: story.passages[0].id}
			});
		}

		story.passages.forEach(p => {
			const passageFixes = Object.keys(passageDefaults).reduce(
				(result, defaultName) => {
					if (typeof story[defaultName] !== typeof storyDefaults[defaultName]) {
						/*
						If the default is an object, we need to copy it so stories
						remain separate.
						*/

						if (typeof storyDefaults[name] === 'object') {
							result[defaultName] = {...storyDefaults[defaultName]};
						} else {
							result[defaultName] = storyDefaults[defaultName];
						}
					}

					return result;
				},
				{}
			);

			if (Object.keys(passageFixes).length !== 0) {
				console.warn(
					`Fixing passage ID ${p.id} properties of story ID ${story.id}`,
					passageFixes
				);
				commit('updatePassage', {
					passageId: p.id,
					passageProps: passageFixes,
					storyId: story.id
				});
			}
		});
	});
}
