import {saveMiddleware} from '../save-middleware';
import {save} from '../save';
import {StoryFormatsState} from '../../../../story-formats/story-formats.types';
import {fakeLoadedStoryFormat} from '../../../../../test-util';

jest.mock('../save');

describe('story formats local storage save middleware', () => {
	const saveMock = save as jest.Mock;
	let state: StoryFormatsState;

	beforeEach(
		() => (state = [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()])
	);

	it('calls save() on a state when a create action is received', () => {
		saveMiddleware(state, {type: 'create', props: state[1]});
		expect(saveMock.mock.calls).toEqual([[state]]);
	});

	it('calls save() on a state when a delete action is received', () => {
		saveMiddleware(state, {type: 'delete', id: 'mock-id'});
		expect(saveMock.mock.calls).toEqual([[state]]);
	});

	it('calls save() on a state when a repair action is received', () => {
		saveMiddleware(state, {type: 'repair'});
		expect(saveMock.mock.calls).toEqual([[state]]);
	});

	it('calls save() on a state when a significant update action is received', () => {
		saveMiddleware(state, {
			type: 'update',
			id: state[0].id,
			props: {name: 'mock-name'}
		});
		expect(saveMock.mock.calls).toEqual([[state]]);
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
		expect(saveMock).not.toHaveBeenCalled();
	});
});
