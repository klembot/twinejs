import {load} from '../load';
import {fakeStory} from '../../../../../test-util';

describe('stories local storage load', () => {
	beforeEach(() => window.localStorage.clear());
	afterEach(() => window.localStorage.clear());

	it('resolves to an array of stories', async () => {
		const state = [fakeStory(), fakeStory()];
		const passageIds: string[] = [];

		window.localStorage.setItem(
			'twine-stories',
			`${state[0].id},${state[1].id}`
		);

		state.forEach(story => {
			window.localStorage.setItem(
				`twine-stories-${story.id}`,
				JSON.stringify({...story, passages: undefined})
			);

			story.passages.forEach(passage => {
				passageIds.push(passage.id);
				window.localStorage.setItem(
					`twine-passages-${passage.id}`,
					JSON.stringify(passage)
				);
			});
		});

		window.localStorage.setItem('twine-passages', passageIds.join(','));
		expect(await load()).toEqual(state);
	});

	it.todo('applies defaults if the persisted data is missing properties');
});
