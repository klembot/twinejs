import {passageDefaults} from '../defaults';
import * as detectIt from 'detect-it';

describe('passageDefaults()', () => {
	const oldDeviceType = detectIt.deviceType;

	afterAll(() => {
		(detectIt as any).deviceType = oldDeviceType;
	});

	it('returns touch-oriented text when on a touch-only device', () => {
		(detectIt as any).deviceType = 'touchOnly';
		expect(passageDefaults().text).toBe('store.passageDefaults.textTouch');
	});

	it('returns mouse-oriented text when on any other device', () => {
		(detectIt as any).deviceType = 'mouseOnly';
		expect(passageDefaults().text).toBe('store.passageDefaults.textClick');
		(detectIt as any).deviceType = 'hybrid';
		expect(passageDefaults().text).toBe('store.passageDefaults.textClick');
	});
});
