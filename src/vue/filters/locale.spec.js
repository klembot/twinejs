const { expect } = require('chai');
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

	it('add a \'say\' filter to Vue linked to locale.say()', () => {
		expect(Vue.filter.calledWith('say')).to.equal(true);
		expect(locale.say.bind.firstCall.args[0]).to.equal(locale);
	});

	it('add a \'sayPlural\' filter to Vue linked to locale.sayPlural()', () => {
		expect(Vue.filter.calledWith('sayPlural')).to.equal(true);
		expect(locale.sayPlural.bind.firstCall.args[0]).to.equal(locale);
	});
});
