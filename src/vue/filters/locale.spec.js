const { spy } = require('sinon');
let Vue = require('vue');
let locale = require('../../locale');
const localeFilters = require('./locale');

describe('locale Vue filters', () => {
	beforeEach(() => {
		locale.say.bind = spy();
		locale.sayPlural.bind = spy();
		Vue.filter = spy();
		localeFilters.addTo(Vue);
	});

	test('add a \'say\' filter to Vue linked to locale.say()', () => {
		expect(Vue.filter.calledWith('say')).toBe(true);
		expect(locale.say.bind.firstCall.args[0]).toBe(locale);
	});

	test('add a \'sayPlural\' filter to Vue linked to locale.sayPlural()', () => {
		expect(Vue.filter.calledWith('sayPlural')).toBe(true);
		expect(locale.sayPlural.bind.firstCall.args[0]).toBe(locale);
	});
});
