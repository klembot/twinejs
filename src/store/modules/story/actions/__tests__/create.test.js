import {createStory} from '../create';
import {actionCommits} from '@/test-utils/vuex';

describe('createStory action', () => {
	it('commits a creatStory mutation with supplied storyProps', () => {
		const payload = {storyProps: {name: 'test'}};
		const commits = actionCommits(createStory, payload);

		expect(commits).toEqual([['createStory', payload]]);
	});
});
