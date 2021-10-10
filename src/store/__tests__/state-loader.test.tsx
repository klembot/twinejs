import {render, screen} from '@testing-library/react';
import {StateLoader} from '../state-loader';
import {usePrefsContext} from '../prefs';
import {useStoriesContext} from '../stories';
import {useStoryFormatsContext, StoryFormat} from '../story-formats';
import {usePersistence} from '../persistence/use-persistence';
import {fakeUnloadedStoryFormat} from '../../test-util';

jest.mock('../prefs/prefs-context');
jest.mock('../stories/stories-context');
jest.mock('../story-formats/story-formats-context');
jest.mock('../persistence/use-persistence');
jest.mock('../../components/loading-curtain/loading-curtain');

describe('<StateLoader>', () => {
	let defaultFormat: StoryFormat;
	let prefsDispatchMock: jest.Mock;
	let formatsDispatchMock: jest.Mock;
	let storiesDispatchMock: jest.Mock;

	beforeEach(() => {
		defaultFormat = fakeUnloadedStoryFormat();
		prefsDispatchMock = jest.fn();
		formatsDispatchMock = jest.fn();
		storiesDispatchMock = jest.fn();

		(usePrefsContext as jest.Mock).mockReturnValue({
			dispatch: prefsDispatchMock,
			prefs: {
				storyFormat: {
					name: defaultFormat.name,
					version: defaultFormat.version
				}
			}
		});
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: formatsDispatchMock,
			formats: [defaultFormat]
		});
		(useStoriesContext as jest.Mock).mockReturnValue({
			dispatch: storiesDispatchMock
		});
		(usePersistence as jest.Mock).mockReturnValue({
			prefs: {load: () => ({mockPrefsState: true})},
			stories: {load: () => ({mockStoriesState: true})},
			storyFormats: {load: () => ({mockStoryFormatsState: true})}
		});
	});

	it('dispatches init and repair actions once mounted', () => {
		render(<StateLoader />);
		expect(prefsDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockPrefsState: true}}],
			[{type: 'repair'}]
		]);
		expect(storiesDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockStoriesState: true}}],
			[{type: 'repair', allFormats: [defaultFormat], defaultFormat}]
		]);
		expect(formatsDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockStoryFormatsState: true}}],
			[{type: 'repair'}]
		]);
	});

	// Unclear how to test the loading state--on initial render loading is
	// complete.

	it('renders children once loaded', () => {
		render(
			<StateLoader>
				<div data-testid="children" />
			</StateLoader>
		);
		expect(screen.getByTestId('children')).toBeInTheDocument();
	});
});
