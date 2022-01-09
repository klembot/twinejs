import {renderHook} from '@testing-library/react-hooks';
import {donationDelay, useDonationCheck} from '../use-donation-check';
import {PrefsContext, PrefsState} from '..';
import {fakePrefs} from '../../../test-util';

describe('useDonationCheck', () => {
	function renderWithPrefs(prefs: Partial<PrefsState>) {
		return renderHook(() => useDonationCheck(), {
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

	it('returns false if the donateShown preference is true', () =>
		expect(
			renderWithPrefs({
				donateShown: true
			}).result.current.shouldShowDonationPrompt()
		).toBe(false));

	it('returns false if the donation delay has not elapsed', () =>
		expect(
			renderWithPrefs({
				donateShown: false,
				firstRunTime: Date.now() - donationDelay + 10000
			}).result.current.shouldShowDonationPrompt()
		).toBe(false));

	it('returns true if the donation delay has elapsed', () =>
		expect(
			renderWithPrefs({
				donateShown: false,
				firstRunTime: Date.now() - donationDelay - 10000
			}).result.current.shouldShowDonationPrompt()
		).toBe(true));
});
