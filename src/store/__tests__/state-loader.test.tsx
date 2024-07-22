import * as React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {fakeUnloadedStoryFormat} from '../../test-util';
import {usePersistence} from '../persistence/use-persistence';
import {usePrefsContext} from '../prefs';
import {StateLoader} from '../state-loader';
import {useStoriesContext} from '../stories';
import {
	StoryFormat,
	StoryFormatsAction,
	useStoryFormatsContext
} from '../story-formats';
import * as useStoriesRepairModule from '../use-stories-repair';

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
			prefs: {load: async () => ({mockPrefsState: true})},
			stories: {load: async () => ({mockStoriesState: true})},
			storyFormats: {load: async () => ({mockStoryFormatsState: true})}
		});
	});

	it('dispatches init and repair actions once mounted', async () => {
		render(<StateLoader />);
		await waitFor(() => expect(storiesDispatchMock).toBeCalled());

		// Order of these actions is crucial. The init must come before the repair.
		// Order of store repairs is tested below.

		expect(prefsDispatchMock.mock.calls).toEqual([
			[{type: 'init', state: {mockPrefsState: true}}],
			[{type: 'repair', allFormats: [defaultFormat]}]
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

	it('repairs story formats, then preferences, then stories', async () => {
		render(<StateLoader />);
		await waitFor(() => expect(storiesDispatchMock).toBeCalled());

		// The second invocation will be the repair--tested above.

		expect(formatsDispatchMock.mock.invocationCallOrder[1]).toBeLessThan(
			prefsDispatchMock.mock.invocationCallOrder[1]
		);
		expect(prefsDispatchMock.mock.invocationCallOrder[1]).toBeLessThan(
			storiesDispatchMock.mock.invocationCallOrder[1]
		);
	});

	it('repairs stories using useStoriesRepair', async () => {
		const repairStories = jest.fn();
		const repairSpy = jest
			.spyOn(useStoriesRepairModule, 'useStoriesRepair')
			.mockReturnValue(repairStories);

		render(<StateLoader />);
		await waitFor(() => expect(storiesDispatchMock).toBeCalled());
		expect(repairStories).toBeCalledTimes(1);
		repairSpy.mockRestore();
	});

	it('uses the repaired story format state when repairing preferences', async () => {
		const repairedFormats = [
			defaultFormat,
			fakeUnloadedStoryFormat({name: 'repaired-story-format'})
		];
		let formatsRepaired = false;

		(useStoryFormatsContext as jest.Mock).mockImplementation(() => ({
			dispatch(action: StoryFormatsAction) {
				if (action.type === 'repair') {
					formatsRepaired = true;
				}
			},
			formats: formatsRepaired ? repairedFormats : [defaultFormat]
		}));

		render(<StateLoader />);
		await waitFor(() => expect(prefsDispatchMock).toBeCalled());
		expect(prefsDispatchMock.mock.calls[1]).toEqual([
			{type: 'repair', allFormats: repairedFormats}
		]);
	});

	it('uses the repaired preferences and story format state when repairing stories', async () => {
		const repairedDefaultFormat = fakeUnloadedStoryFormat();
		const repairedFormats = [defaultFormat, repairedDefaultFormat];
		let formatsRepaired = false;
		const repairedPrefs = {
			repaired: true,
			storyFormat: {
				name: repairedDefaultFormat.name,
				version: repairedDefaultFormat.version
			}
		};
		let prefsRepaired = false;

		(usePrefsContext as jest.Mock).mockImplementation(() => ({
			dispatch(action: StoryFormatsAction) {
				if (action.type === 'repair') {
					prefsRepaired = true;
				}
			},
			prefs: prefsRepaired
				? repairedPrefs
				: {
						storyFormat: {
							name: defaultFormat.name,
							version: defaultFormat.version
						}
				  }
		}));
		(useStoryFormatsContext as jest.Mock).mockImplementation(() => ({
			dispatch(action: StoryFormatsAction) {
				if (action.type === 'repair') {
					formatsRepaired = true;
				}
			},
			formats: formatsRepaired ? repairedFormats : [defaultFormat]
		}));
		render(<StateLoader />);
		await waitFor(() => expect(storiesDispatchMock).toBeCalled());
		expect(storiesDispatchMock.mock.calls[1]).toEqual([
			{
				type: 'repair',
				allFormats: repairedFormats,
				defaultFormat: repairedDefaultFormat
			}
		]);
	});

	it('renders children once loaded', async () => {
		render(
			<StateLoader>
				<div data-testid="children" />
			</StateLoader>
		);
		expect(screen.queryByTestId('children')).not.toBeInTheDocument();
		expect(await screen.findByTestId('children')).toBeInTheDocument();
	});
});
