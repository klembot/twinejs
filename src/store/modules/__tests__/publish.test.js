import {publishArchive, publishStory} from '../../publish';

describe('publish Vuex functions', () => {
	describe('publishArchive()', () => {
		it.todo(
			'returns the result of publishArchive with all stories in the state'
		);
	});

	describe('publishStory()', () => {
		it.todo('returns the published source ');
		it.todo(
			'throws an error if the story ID requested does not exist in the store'
		);
		it.todo('uses the latest compatible version of the stoy format available');
		it.todo("loads the story format if it hasn't already");
		it.todo(
			'throws an error if the format the story is linked to does not exist'
		);
	});
});
