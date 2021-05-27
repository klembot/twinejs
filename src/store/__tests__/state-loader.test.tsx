import {render, screen} from '@testing-library/react';
import {StateLoader} from '../state-loader';
import {usePrefsContext} from '../prefs/prefs-context';
import {useStoriesContext} from '../stories/stories-context';
import {useStoryFormatsContext} from '../story-formats/story-formats-context';
import {usePersistence} from '../persistence/use-persistence';

jest.mock('../prefs/prefs-context');
jest.mock('../stories/stories-context');
jest.mock('../story-formats/story-formats-context');
jest.mock('../persistence/use-persistence');
jest.mock('../../components/loading-curtain/loading-curtain');

describe('<StateLoader>', () => {
	let prefsDispatchMock: jest.Mock;
	let formatsDispatchMock: jest.Mock;
	let storiesDispatchMock: jest.Mock;

	beforeEach(() => {
		prefsDispatchMock = jest.fn();
		formatsDispatchMock = jest.fn();
		storiesDispatchMock = jest.fn();

		(usePrefsContext as jest.Mock).mockReturnValue({
			dispatch: prefsDispatchMock
		});
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: formatsDispatchMock
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

	it('dispatches init actions once mounted', () => {
		render(<StateLoader />);
		expect(prefsDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockPrefsState: true}}]
		]);
		expect(storiesDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockStoriesState: true}}]
		]);
		expect(formatsDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockStoryFormatsState: true}}]
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
