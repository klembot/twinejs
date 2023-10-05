import {saveJson} from '../save-json';
import {TwineElectronWindow} from '../../../../electron/shared';

describe('saveJson()', () => {
	afterEach(() => delete (window as TwineElectronWindow).twineElectron);

	it('calls saveJson on the twineElectron global', () => {
		const saveJson = jest.fn();
		const mockObject = {mock: true};

		(window as any).twineElectron = {
			saveJson
		};

		saveJson('test.json', mockObject);
		expect(saveJson.mock.calls).toEqual([['test.json', mockObject]]);
	});

	it('throws an error if twineElectron.saveJson is undefined', () => {
		expect(() => saveJson('test.json', {})).toThrow();
	});
});
