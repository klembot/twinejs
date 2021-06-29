import {saveJson} from '../save-json';
import {TwineElectronWindow} from '../../../../electron/shared';

describe('saveJson()', () => {
	afterEach(() => delete (window as TwineElectronWindow).twineElectron);

	it('sends a save-json IPC event', () => {
		const sendSpy = jest.fn();
		const mockObject = {mock: true};

		(window as any).twineElectron = {
			ipcRenderer: {send: sendSpy}
		};

		saveJson('test.json', mockObject);
		expect(sendSpy.mock.calls).toEqual([
			['save-json', 'test.json', mockObject]
		]);
	});

	it('throws an error if the IPC emitter is not available', () => {
		expect(() => saveJson('test.json', {})).toThrow();
	});
});
