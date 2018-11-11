const { expect } = require("chai");
const { spy } = require("sinon");
let Vue = require("fullvue");
const VueRouter = require("vue-router");

const localeFilters = require("../vue/filters/locale");
const WelcomeView = require("./index");
const router = require("../common/router");
const store = require("../data/store");

localeFilters.addTo(Vue);
Vue.use(VueRouter);

describe("<welcome>", () => {
	let vm;

	beforeEach(() => {
		vm = new WelcomeView({ router: router, store: store }).$mount();
		vm.setPref = spy();
		vm.$router.push = spy();
	});

	it("starts with one <div> shown", () => {
		expect(vm.shown).to.equal(1);
		expect(vm.$el.querySelectorAll("#welcomeView > div").length).to.equal(1);
	});

	it("shows the matching number of <div>s", done => {
		const check = count => {
			vm.shown = count;

			Vue.config.errorHandler = done;
			Vue.nextTick(() => {
				expect(vm.$el.querySelectorAll("#welcomeView > div").length).to.equal(
					count
				);

				if (count < 4) {
					check(count + 1);
				} else {
					done();
				}
			});
		};

		check(1);
	});

	it("increments the number of <div>s with next()", () => {
		const startCount = vm.shown;

		vm.next();
		expect(vm.shown).to.equal(startCount + 1);
	});

	it("records that the user viewed it with finish()", () => {
		vm.finish();

		const args = vm.setPref.firstCall.args;

		expect(args[0]).to.equal("welcomeSeen");
		expect(args[1]).to.equal(true);
	});

	it("pushes stories to the router on finish()", () => {
		vm.finish();
		const args = vm.$router.push.firstCall.args;

		// Checking if route actually updated means mounting the router
		expect(args[0]).to.equal("stories");
	});
});
