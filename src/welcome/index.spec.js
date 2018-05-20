const { expect } = require('chai');
const { spy } = require('sinon');
let Vue = require('vue');
const localeFilters = require('../vue/filters/locale');
const WelcomeView = require('./index');

localeFilters.addTo(Vue);

describe('<welcome>', () => {
	let vm;

	beforeEach(() => {
		vm = new WelcomeView();
		vm.setPref = spy();
		vm.$mount();
	});

	it('starts with one <div> shown', () => {
		expect(vm.shown).to.equal(1);
		expect(vm.$el.querySelectorAll('#welcomeView > div').length).to.equal(1);
	});

	it('shows the matching number of <div>s', done => {
		const check = count => {
			vm.shown = count;

			Vue.nextTick(() => {
				expect(
					vm.$el.querySelectorAll('#welcomeView > div').length
				).to.equal(count);

				if (count < 4) {
					check(count + 1);
				}
				else {
					done();
				}
			});
		};

		check(1);
	});

	it('increments the number of <div>s with next()', () => {
		const startCount = vm.shown;

		vm.next();
		expect(vm.shown).to.equal(startCount + 1);
	});

	it('records that the user viewed it with finish()', () => {
		vm.finish();

		const args = vm.setPref.firstCall.args;

		expect(args[0]).to.equal('welcomeSeen');
		expect(args[1]).to.equal(true);
	});

	it('moves to the story list with finish()', () => {
		vm.finish();
		expect(window.location.hash).to.equal('#stories');
	});
});

