import {toHaveNoViolations} from 'jest-axe';
import {configure} from '@testing-library/dom';
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Always mock these files so that Jest doesn't see import.meta.

jest.mock('./util/i18n');

// Mock this component so that we don't get spurious errors around needing
// focusable elements, because often we're mocking contents.

jest.mock('focus-trap-react');

configure({asyncUtilTimeout: 5000});

expect.extend(toHaveNoViolations);

// jsdom doesn't implement window.matchMedia, but TS knows about it, so we
// have to do some hacky stuff here.

beforeEach(
	() =>
		((window as any).matchMedia = jest.fn(() => ({
			addEventListener: jest.fn(),
			matches: false,
			removeEventListener: jest.fn()
		})))
);
afterEach(() => delete (window as any).matchMedia);

// jsdom also doesn't implement pointer events properly.
// see https://github.com/testing-library/dom-testing-library/issues/558

(window as any).PointerEvent = class FakePointerEvent extends Event {
	constructor(type: string, props: Record<string, unknown>) {
		super(type, props);

		for (const propName of [
			'button',
			'clientX',
			'clientY',
			'pointerType',
			'shiftKey'
		]) {
			if (props[propName] !== null) {
				(this as any)[propName] = props[propName];
			}
		}
	}
};

window.Element.prototype.releasePointerCapture = () => {};
window.Element.prototype.setPointerCapture = () => {};
