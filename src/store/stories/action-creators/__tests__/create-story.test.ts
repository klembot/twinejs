import {createStory} from '../create-story';
import {PrefsState} from '../../../prefs';
import {Story} from '../../stories.types';
import {fakePrefs, fakeStory} from '../../../../test-util';
import {lorem} from 'faker';

describe('createStory action creator', () => {
	let dispatch: jest.Mock;
	let name: string;
	let prefs: PrefsState;
	let stories: Story[];

	beforeEach(() => {
		dispatch = jest.fn();
		name = lorem.words(3);
		prefs = fakePrefs();
		stories = [fakeStory()];
	});

	describe('the thunk it returns', () => {
		it('dispatches a createStory action with the default story format', () => {
			createStory(stories, prefs, {name})(dispatch, () => stories);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'createStory',
						props: {
							name,
							id: expect.any(String),
							storyFormat: prefs.storyFormat.name,
							storyFormatVersion: prefs.storyFormat.version
						}
					}
				]
			]);
		});

		it('throws an error if an empty name is provided', () =>
			expect(() =>
				createStory(stories, prefs, {name: ''})(dispatch, () => stories)
			).toThrow());

		it('throws an error if a story exists in state with the same name', () =>
			expect(() =>
				createStory(stories, prefs, {name: stories[0].name})(
					dispatch,
					() => stories
				)
			).toThrow());

		it('returns the ID of the new story', () => {
			const id = createStory(stories, prefs, {name})(dispatch, () => stories);

			expect(dispatch.mock.calls[0][0].props.id).toBe(id);
		});

		it('allows the format to be overridden', () => {
			createStory(stories, prefs, {
				name,
				storyFormat: 'mock-story-format',
				storyFormatVersion: '1.2.3'
			})(dispatch, () => stories);

			expect(dispatch.mock.calls[0][0].props.storyFormat).toBe(
				'mock-story-format'
			);
			expect(dispatch.mock.calls[0][0].props.storyFormatVersion).toBe('1.2.3');
		});
	});
});
