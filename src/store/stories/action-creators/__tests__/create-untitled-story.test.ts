import {createUntitledStory} from '../create-untitled-story';
import {PrefsState} from '../../../prefs';
import {storyDefaults} from '../../defaults';
import {Story} from '../../stories.types';
import {fakePrefs, fakeStory} from '../../../../test-util';

describe('createUntitledStory action creator', () => {
	let dispatch: jest.Mock;
	let prefs: PrefsState;
	let stories: Story[];

	beforeEach(() => {
		dispatch = jest.fn();
		prefs = fakePrefs();
		stories = [fakeStory()];
	});

	describe('the thunk it returns', () => {
		it('dispatches a createStory action with the default story format', () => {
			createUntitledStory(stories, prefs)(dispatch, () => stories);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'createStory',
						props: {
							id: expect.any(String),
							name: expect.any(String),
							storyFormat: prefs.storyFormat.name,
							storyFormatVersion: prefs.storyFormat.version
						}
					}
				]
			]);
		});

		it('assigns a unique name to the story', () => {
			stories[0].name = storyDefaults().name;
			createUntitledStory(stories, prefs)(dispatch, () => stories);
			expect(dispatch.mock.calls[0][0].props.name).not.toBe(stories[0].name);
		});

		it('returns the ID of the new story', () => {
			const id = createUntitledStory(stories, prefs)(dispatch, () => stories);

			expect(dispatch.mock.calls[0][0].props.id).toBe(id);
		});

		it('allows the format to be overridden', () => {
			createUntitledStory(stories, prefs, {
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
