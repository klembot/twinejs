/* Add jest-axe. */

import {toHaveNoViolations} from 'jest-axe';

expect.extend(toHaveNoViolations);

/*
Automock the i18n module here because nearly every module uses it in some way.
*/

jest.mock('./src/util/i18n');
