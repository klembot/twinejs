import {saveMiddleware} from '../save-middleware';
import {saveJson} from '../../save-json';
import {PrefsState} from '../../../../prefs';
import {fakePrefs} from '../../../../../test-util';

jest.mock('../../save-json');

describe('prefs Electron IPC save middleware', () => {
	const saveJsonMock = saveJson as jest.Mock;
	let prefs: PrefsState;

	beforeEach(() => {
		prefs = fakePrefs();
	});

	it('calls saveJson() on a state when an update action is received', () => {
		saveMiddleware(prefs, {type: 'update', name: 'locale', value: 'en'});
		expect(saveJsonMock.mock.calls).toEqual([['prefs.json', prefs]]);
	});

	it('calls saveJson() on a state when a repair action is received', () => {
		saveMiddleware(prefs, {type: 'repair'});
		expect(saveJsonMock.mock.calls).toEqual([['prefs.json', prefs]]);
	});

	it('does not call saveJson() on any other action', () => {
		saveMiddleware(prefs, {type: 'init', state: {}});
		expect(saveJsonMock).not.toHaveBeenCalled();
	});
});
