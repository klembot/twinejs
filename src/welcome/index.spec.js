const {spy} = require('sinon');
let Vue = require('vue');
const localeFilters = require('../vue/filters/locale');
const WelcomeView = require('./index');

localeFilters.addTo(Vue);

describe.skip('<welcome>', () => {
	let vm;
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		vm = new WelcomeView();
		vm.setPref = spy();
		vm.$mount(container);
	});

	test('starts with one <div> shown', () => {
		expect(vm.shown).toBe(1);
		expect(vm.$el.querySelectorAll('#welcomeView > div').length).toBe(1);
	});

	test('shows the matching number of <div>s', done => {
		const check = count => {
			vm.shown = count;

			Vue.nextTick(() => {
				expect(
					vm.$el.querySelectorAll('#welcomeView > div').length
				).toBe(count);

				if (count < 4) {
					check(count + 1);
				} else {
					done();
				}
			});
		};

		check(1);
	});

	test('increments the number of <div>s with next()', () => {
		const startCount = vm.shown;

		vm.next();
		expect(vm.shown).toBe(startCount + 1);
	});

	test('records that the user viewed it with finish()', () => {
		vm.finish();

		const args = vm.setPref.firstCall.args;

		expect(args[0]).toBe('welcomeSeen');
		expect(args[1]).toBe(true);
	});

	test('moves to the story list with finish()', () => {
		vm.finish();
		expect(window.location.hash).toBe('#stories');
	});
});
