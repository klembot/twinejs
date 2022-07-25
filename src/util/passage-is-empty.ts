import {Passage} from '../store/stories';

/**
 * Returns whether a passage is considered empty, e.g. whether the user has put
 * any content into it.
 */
export function passageIsEmpty(passage: Passage) {
	return (
		passage.text === '' &&
		passage.tags.length === 0 &&
		passage.width === 100 &&
		passage.height === 100
	);
}
