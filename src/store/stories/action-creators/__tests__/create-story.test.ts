import {createStory} from '../create-story';
import {PrefsState} from '../../../prefs';
import {fakePrefs} from '../../../../test-util/fakes';

describe('createStory action creator', () => {
	let prefs: PrefsState;

	beforeEach(() => (prefs = fakePrefs()));

	it('returns a createStory action with the default story format', () => {
		expect(createStory({name: 'test story'}, prefs)).toEqual({
			type: 'createStory',
			props: {
				name: 'test story',
				storyFormat: prefs.storyFormat.name,
				storyFormatVersion: prefs.storyFormat.version
			}
		});
	});

	it('allows the format to be overridden', () =>
		expect(
			createStory(
				{
					name: 'test story',
					storyFormat: 'mock-story-format',
					storyFormatVersion: '1.2.3'
				},
				prefs
			)
		).toEqual({
			type: 'createStory',
			props: {
				name: 'test story',
				storyFormat: 'mock-story-format',
				storyFormatVersion: '1.2.3'
			}
		}));
});
