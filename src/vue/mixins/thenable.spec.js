require('core-js');
const { expect } = require('chai');
const { spy } = require('sinon');
const Vue = require('vue');
const { symbols: { resolve, reject }, thenable } = require('./thenable');

describe('thenable Vue mixin', () => {
	let receiver, vm, vmChild;

	beforeEach(() => {
		vmChild = new Vue({
			mixins: [thenable],
			methods: {
				resolvePromise() {
					this[resolve]('Hello world from child');
				}
			}
		});

		vm = new Vue({
			template: '<child-vm></child-vm>',
			mixins: [thenable],
			methods: {
				rejectPromise() {
					this[reject]('Hello world');
				},

				resolvePromise() {
					this[resolve]('Hello world');
				}
			},
			components: {
				'child-vm': vmChild
			}
		});

		receiver = spy();
	});

	it('adds promise methods to a Vue component', () => {
		expect(vm.then).to.be.a('function');
		expect(vm.catch).to.be.a('function');
	});

	it('implements Promise.then()', done => {
		vm.then(receiver);
		vm.resolvePromise();
		window.setTimeout(() => {
			expect(receiver.called).to.equal(true);
			done();
		}, 0);
	});

	it('implements Promise.catch()', done => {
		vm.catch(receiver);
		vm.rejectPromise();
		window.setTimeout(() => {
			expect(receiver.called).to.equal(true);
			done();
		}, 0);
	});
	
	/* Can't figure out how to get this to work. */

	it('resolves if a direct child that is thenable resolves'/*, done => {
		vm.$mount();
		Vue.nextTick(() => {
			vm.then(receiver);
			vmChild.resolvePromise();
			window.setTimeout(() => {
				expect(receiver.called).to.equal(true);
				done();
			}, 0);
		});
	}*/);
});
