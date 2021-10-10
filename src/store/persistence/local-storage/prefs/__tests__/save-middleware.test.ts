import {saveMiddleware} from '../save-middleware';
import {save} from '../save';
import {PrefsState} from '../../../../prefs';
import {fakePrefs} from '../../../../../test-util';

jest.mock('../save');

describe('prefs local storage save middleware', () => {
	const saveMock = save as jest.Mock;
	let prefs: PrefsState;

	beforeEach(() => {
		prefs = fakePrefs();
	});

	it('calls save() on a state when an update action is received', () => {
		saveMiddleware(prefs, {type: 'update', name: 'locale', value: 'en'});
		expect(saveMock.mock.calls).toEqual([[prefs]]);
	});

	it('calls save() on a state when a repair action is received', () => {
		saveMiddleware(prefs, {type: 'repair'});
		expect(saveMock.mock.calls).toEqual([[prefs]]);
	});

	it('does not call save on any other action', () => {
		saveMiddleware(prefs, {type: 'init', state: {}});
		expect(saveMock).not.toHaveBeenCalled();
	});
});
