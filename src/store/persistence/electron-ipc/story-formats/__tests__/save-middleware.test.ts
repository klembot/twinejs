import {saveMiddleware} from '../save-middleware';
import {saveJson} from '../../save-json';
import {StoryFormatsState} from '../../../../story-formats/story-formats.types';
import {fakeUnloadedStoryFormat} from '../../../../../test-util';

jest.mock('../../save-json');

describe('story formats Electron IPC save middleware', () => {
	const saveJsonMock = saveJson as jest.Mock;
	let state: StoryFormatsState;

	function minusLoadStateAndSelected(state: StoryFormatsState) {
		return state.map(format => ({
			...format,
			loadState: undefined,
			selected: undefined
		}));
	}

	beforeEach(
		() => (state = [fakeUnloadedStoryFormat(), fakeUnloadedStoryFormat()])
	);

	it('calls save() on a state when a create action is received', () => {
		saveMiddleware(state, {type: 'create', props: state[1]});
		expect(saveJsonMock.mock.calls).toEqual([
			['story-formats.json', minusLoadStateAndSelected(state)]
		]);
	});

	it('calls save() on a state when a delete action is received', () => {
		saveMiddleware(state, {type: 'delete', id: 'mock-id'});
		expect(saveJsonMock.mock.calls).toEqual([
			['story-formats.json', minusLoadStateAndSelected(state)]
		]);
	});

	it('calls save() on a state when a repair action is received', () => {
		saveMiddleware(state, {type: 'repair'});
		expect(saveJsonMock.mock.calls).toEqual([
			['story-formats.json', minusLoadStateAndSelected(state)]
		]);
	});

	it('calls save() on a state when a significant update action is received', () => {
		saveMiddleware(state, {
			type: 'update',
			id: state[0].id,
			props: {name: 'mock-name'}
		});
		expect(saveJsonMock.mock.calls).toEqual([
			['story-formats.json', minusLoadStateAndSelected(state)]
		]);
	});

	it('takes no action if a non-significant update action is received', () => {
		saveMiddleware(state, {
			type: 'update',
			id: state[0].id,
			props: {
				loadState: 'loaded',
				properties: {name: 'mock-name', source: '', version: '1.2.3'}
			}
		});
		expect(saveJsonMock).not.toHaveBeenCalled();
	});
});
