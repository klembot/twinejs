const { expect } = require('chai');
const Vue = require('vue');
const CodeMirror = require('./codemirror');

describe('<code-mirror>', () => {
	let vm;

	beforeEach(() => {
		/*
		jsdom doesn't implement some functionality that CodeMirror expects.
		https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/2
		(note that there's a typo in the example source that leaves out body in
		document.body)
		*/

		document.body.createTextRange = document.body.createTextRange || (() => ({
			setEnd: () => {},
			setStart: () => {},
			getBoundingClientRect: () => ({ right: 0 }),
			getClientRects: () => ({})
		}));
		
		vm = new Vue({
			template: '<code-mirror v-ref:cm text="Hello world." ' +
				':options="{ tabSize: 12 }"></code-mirror>',
			components: {
				'code-mirror': CodeMirror
			}
		});

		vm.$mount();
	});

	it('creates a CodeMirror instance when mounted', () => {
		expect(vm.$refs.cm.$cm).to.be.a('object');
	});

	it('sets content initially with the text property', () => {
		expect(vm.$refs.cm.$cm.getValue()).to.equal('Hello world.');
	});

	it('sets options with the options property', () => {
		expect(vm.$refs.cm.$cm.getOption('tabSize')).to.equal(12);
	});

	it('keeps the text property in sync', () => {
		expect(vm.$refs.cm.text).to.equal(vm.$refs.cm.$cm.getValue());
		vm.$refs.cm.$cm.setValue('Something completely different!');
		expect(vm.$refs.cm.text).to.equal(vm.$refs.cm.$cm.getValue());
	});
});
