/* Add jest-axe. */

import {toHaveNoViolations} from 'jest-axe';
import Vue from 'vue';
import {config as vueTestUtilsConfig} from '@vue/test-utils';

expect.extend(toHaveNoViolations);

/*
Automock the i18n module here because nearly every module uses it in some way.
*/

jest.mock('./src/util/i18n');

/*
Stub the i18n directive for components.
*/

vueTestUtilsConfig.mocks.$t = msg => `$t: ${msg}`;
Vue.directive('t', (el, {value}) => (el.innerHTML = `$t: ${value}`));
