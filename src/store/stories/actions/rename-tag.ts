import {StoriesDispatch, Story} from '../stories.types';

export function renameTag(
	dispatch: StoriesDispatch,
	story: Story,
	oldName: string,
	newName: string
) {
	if (newName.includes(' ')) {
		throw new Error('Tag names may not contain spaces.');
	}

	story.passages.forEach(passage => {
		if (passage.tags.includes(oldName)) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {
					tags: passage.tags.map(tag => (tag === oldName ? newName : tag))
				},
				storyId: story.id
			});
		}
	});
}
