// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import {toHaveNoViolations} from 'jest-axe';
import '@testing-library/jest-dom';
import {i18n} from './util/i18n';

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
