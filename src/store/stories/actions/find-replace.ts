import {createRegExp, escapeRegExpReplace} from '../../../util/regexp';
import {updatePassage} from './update-passage';
import {
	Passage,
	StoriesDispatch,
	Story,
	StorySearchFlags
} from '../stories.types';

export function replaceInPassage(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage,
	searchFor: string,
	replaceWith: string,
	flags: StorySearchFlags
) {
	const {includePassageNames, matchCase, useRegexes} = flags;
	const passageProps: Partial<Passage> = {};
	const matcher = createRegExp(searchFor, {matchCase, useRegexes});
	const replacer = useRegexes
		? replaceWith
		: escapeRegExpReplace(replaceWith);

	passageProps.text = passage.text.replace(matcher, replacer);

	if (includePassageNames) {
		passageProps.name = passage.name.replace(matcher, replacer);
	}

	if (
		passageProps.text !== passage.text ||
		(passageProps.name !== undefined && passageProps.name !== passage.name)
	) {
		updatePassage(dispatch, story, passage, passageProps);
	}
}

// TODO: return a count of changes

export function replaceInStory(
	dispatch: StoriesDispatch,
	story: Story,
	searchFor: string,
	replaceWith: string,
	flags: StorySearchFlags
) {
	story.passages.forEach(passage => {
		replaceInPassage(
			dispatch,
			story,
			passage,
			searchFor,
			replaceWith,
			flags
		);
	});
}
