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

	test('adds a $mountTo method to a Vue component', () => {
		expect(typeof vm.$mountTo).toBe('function');
	});

	test('mounts a Vue component with $mountTo()', done => {
		vm.$mountTo(document.body);
		
		Vue.nextTick(() => {
			expect(document.querySelector('#mounted')).toBeDefined();
			expect(document.querySelector('#mounted').innerHTML).toBe('Hello world.');
			done();
		});
	});
});
