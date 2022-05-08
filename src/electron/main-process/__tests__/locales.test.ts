import {initLocales} from '../locales';
import i18next from 'i18next';
import {loadPrefs} from '../prefs';

jest.mock('i18next');
jest.mock('../prefs');

describe('initLocales()', () => {
	const changeLanguageMock = i18next.changeLanguage as jest.Mock;
	const loadPrefsMock = loadPrefs as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
	});

	it('sets the locale based on user preference', async () => {
		loadPrefsMock.mockResolvedValue({locale: 'mock-locale'});
		await initLocales();
		expect(changeLanguageMock.mock.calls).toEqual([['mock-locale']]);
	});

	it('does not throw an error if loading user preferences fails', async () => {
		jest.spyOn(console, 'warn').mockReturnValue();
		loadPrefsMock.mockRejectedValue(new Error());
		expect(async () => await initLocales()).not.toThrow();
		expect(changeLanguageMock).not.toHaveBeenCalled();
	});
});
