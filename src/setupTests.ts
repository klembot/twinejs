// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import {toHaveNoViolations} from 'jest-axe';
import {configure} from '@testing-library/dom';
import '@testing-library/jest-dom';
import {i18n} from './util/i18n';

configure({asyncUtilTimeout: 5000});

expect.extend(toHaveNoViolations);
i18n.t = (value: string) => value;

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

		for (const propName of ['button', 'clientX', 'clientY', 'pointerType', 'shiftKey']) {
			if (props[propName] !== null) {
				(this as any)[propName] = props[propName];
			}
		}
	}
}

window.Element.prototype.releasePointerCapture = () => {};
window.Element.prototype.setPointerCapture = () => {};