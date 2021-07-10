import {Thunk} from 'react-hook-thunk-reducer';
import {createRegExp, escapeRegExpReplace} from '../../../util/regexp';
import {updatePassage} from './update-passage';
import {
	Passage,
	StoriesAction,
	StoriesState,
	Story,
	StorySearchFlags
} from '../stories.types';

export function replaceInPassage(
	story: Story,
	passage: Passage,
	searchFor: string,
	replaceWith: string,
	flags: StorySearchFlags
): Thunk<StoriesState, StoriesAction> {
	return (dispatch, getState) => {
		if (searchFor === '') {
			throw new Error("Can't replace an empty string");
		}

		if (passage.story !== story.id) {
			throw new Error('Passage does not belong to story');
		}

		const {includePassageNames, matchCase, useRegexes} = flags;
		const matcher = createRegExp(searchFor, {matchCase, useRegexes});
		const props: Partial<Passage> = {};
		const replacer = useRegexes
			? replaceWith
			: escapeRegExpReplace(replaceWith);

		const newText = passage.text.replace(matcher, replacer);

		if (newText !== passage.text) {
			props.text = newText;
		}

		if (includePassageNames) {
			const newName = passage.name.replace(matcher, replacer);

			if (newName !== passage.name) {
				props.name = newName;
			}
		}

		if (Object.keys(props).length > 0) {
			updatePassage(story, passage, props)(dispatch, getState);
		}
	};
}

export function replaceInStory(
	story: Story,
	searchFor: string,
	replaceWith: string,
	flags: StorySearchFlags
): Thunk<StoriesState, StoriesAction> {
	return (dispatch, getState) =>
		story.passages.forEach(passage => {
			replaceInPassage(
				story,
				passage,
				searchFor,
				replaceWith,
				flags
			)(dispatch, getState);
		});
}
