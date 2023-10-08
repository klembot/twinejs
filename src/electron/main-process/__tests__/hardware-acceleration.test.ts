import {app} from 'electron';
import {AppPrefName, getAppPref, setAppPref} from '../app-prefs';
import {
	initHardwareAcceleration,
	toggleHardwareAcceleration
} from '../hardware-acceleration';
import {showRelaunchDialog} from '../relaunch-dialog';

jest.mock('electron');
jest.mock('../app-prefs');
jest.mock('../relaunch-dialog');

describe('initHardwareAcceleration', () => {
	const getAppPrefMock = getAppPref as jest.Mock;
	const disableHardwareAccelerationMock =
		app.disableHardwareAcceleration as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
	});

	it('disables hardware acceleration if the app pref is true', () => {
		getAppPrefMock.mockImplementation((name: AppPrefName) => {
			if (name === 'disableHardwareAcceleration') {
				return true;
			}

			throw new Error(`Asked for a non-mocked pref: ${name}`);
		});

		initHardwareAcceleration();
		expect(disableHardwareAccelerationMock).toBeCalledTimes(1);
	});

	it("doesn't disable hardware acceleration if the app pref is falsy", () => {
		getAppPrefMock.mockImplementation((name: AppPrefName) => {
			if (name === 'disableHardwareAcceleration') {
				return undefined;
			}

			throw new Error(`Asked for a non-mocked pref: ${name}`);
		});

		initHardwareAcceleration();
		expect(disableHardwareAccelerationMock).not.toBeCalled();
	});
});

describe('toggleHardwareAcceleration', () => {
	const getAppPrefMock = getAppPref as jest.Mock;
	const setAppPrefMock = setAppPref as jest.Mock;
	const showRelaunchDialogMock = showRelaunchDialog as jest.Mock;

	it('sets the preference to true if the preference was falsy', () => {
		getAppPrefMock.mockImplementation((name: AppPrefName) => {
			if (name === 'disableHardwareAcceleration') {
				return true;
			}

			throw new Error(`Asked for a non-mocked pref: ${name}`);
		});

		toggleHardwareAcceleration();
		expect(setAppPrefMock.mock.calls).toEqual([
			['disableHardwareAcceleration', false]
		]);
	});

	it('sets the preference to false if the preference was true', () => {
		getAppPrefMock.mockImplementation((name: AppPrefName) => {
			if (name === 'disableHardwareAcceleration') {
				return false;
			}

			throw new Error(`Asked for a non-mocked pref: ${name}`);
		});

		toggleHardwareAcceleration();
		expect(setAppPrefMock.mock.calls).toEqual([
			['disableHardwareAcceleration', true]
		]);
	});

	it('shows the relaunch dialog', () => {
		toggleHardwareAcceleration();
		expect(showRelaunchDialogMock).toBeCalledTimes(1);
	});
});
