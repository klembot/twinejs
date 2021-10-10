import {renderHook} from '@testing-library/react-hooks';
import {fakePrefs} from '../../../test-util';
import {PrefsContext, PrefsState} from '..';
import {useComputedTheme} from '../use-computed-theme';

describe('useComputedTheme()', () => {
	function renderWithPrefs(prefs: Partial<PrefsState>) {
		return renderHook(() => useComputedTheme(), {
			wrapper: ({children}) => (
				<PrefsContext.Provider
					value={{
						dispatch: jest.fn(),
						prefs: {...fakePrefs(), ...prefs}
					}}
				>
					{children}
				</PrefsContext.Provider>
			)
		});
	}

	let darkQueryMock = {addEventListener: jest.fn(), matches: true};

	// jsdom doesn't implement window.matchMedia, but TS knows about it, so we
	// have to do some hacky stuff here.

	beforeEach(() => ((window as any).matchMedia = jest.fn(() => darkQueryMock)));
	afterEach(() => delete (window as any).matchMedia);

	it('returns the preference if it is dark or light', () => {
		expect(renderWithPrefs({appTheme: 'dark'}).result.current).toBe('dark');
		expect(renderWithPrefs({appTheme: 'light'}).result.current).toBe('light');
	});

	it('returns the browser theme if the preference is system', () => {
		darkQueryMock.matches = true;
		expect(renderWithPrefs({appTheme: 'system'}).result.current).toBe('dark');
		darkQueryMock.matches = false;
		expect(renderWithPrefs({appTheme: 'system'}).result.current).toBe('light');
	});
});
