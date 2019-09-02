import Vue from 'vue';
import locale from '../../locale';
import localeFilters from './locale';

describe('locale Vue filters', () => {
	beforeEach(() => {
		locale.say.bind = jest.fn();
		locale.sayPlural.bind = jest.fn();
		jest.doMock('vue');
		Vue.filter = jest.fn();
		localeFilters.addTo(Vue);
	});

	test("add a 'say' filter to Vue linked to locale.say()", () => {
		expect(Vue.filter).toHaveBeenCalledWith('say', undefined);
		expect(locale.say.bind).toHaveBeenNthCalledWith(1, locale);
	});

	test("add a 'sayPlural' filter to Vue linked to locale.sayPlural()", () => {
		expect(Vue.filter).toHaveBeenCalledWith('sayPlural', undefined);
		expect(locale.sayPlural.bind).toHaveBeenNthCalledWith(1, locale);
	});
});
