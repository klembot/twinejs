const { expect } = require('chai');
const Vue = require('vue');
const mountTo = require('./mount-to');

describe('mountTo Vue mixin', () => {
	let vm;

	beforeEach(() => {
		vm = new Vue({
			template: '<p id="mounted">Hello world.</p>',
			mixins: [mountTo]
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('adds a $mountTo method to a Vue component', () => {
		expect(vm.$mountTo).to.be.a('function');
	});

	it('mounts a Vue component with $mountTo()', done => {
		vm.$mountTo(document.body);
		
		Vue.nextTick(() => {
			expect(document.querySelector('#mounted')).to.exist;
			expect(document.querySelector('#mounted').innerHTML)
				.to.equal('Hello world.');
			done();
		});
	});
});
