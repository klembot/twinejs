let Vue = require('vue');
const VueRouter = require('vue-router');
const localeFilters = require('../vue/filters/locale');
const WelcomeView = require('./index');
const router = require('../common/router');
const store = require('../data/store');

localeFilters.addTo(Vue);
Vue.use(VueRouter);

describe.skip('<welcome>', () => {
	let vm;
	let container;

	beforeEach(() => {
		vm = new WelcomeView({ router: router, store: store }).$mount();
		vm.setPref = jest.fn();
		vm.$router.push = jest.fn();
	});

	test('starts with one <div> shown', () => {
		expect(vm.shown).toBe(1);
		expect(vm.$el.querySelectorAll('#welcomeView > div').length).toBe(1);
	});

	test('shows the matching number of <div>s', done => {
		const check = count => {
			vm.shown = count;

			Vue.config.errorHandler = done;
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

	it('pushes stories to the router on finish()', () => {
		vm.finish();
		const args = vm.$router.push.firstCall.args;

		// Checking if route actually updated means mounting the router
		expect(args[0]).toBe('stories');
	});
});
