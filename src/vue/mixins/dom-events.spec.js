let domEventSpecial = require('dom-event-special');
const { expect } = require('chai');
const { spy, stub } = require('sinon');
const Vue = require('vue');
const domEvents = require('./dom-events');

describe('dom-events Vue mixin', () => {
	const body = document.querySelector('body');
	const handler = function() { return this; };
	let component;

	beforeEach(() => {
		component = new Vue({ mixins: [domEvents] });
		spy(handler, 'bind');
		stub(domEventSpecial, 'on');
		stub(domEventSpecial, 'off');
	});

	afterEach(() => {
		handler.bind.restore();
		domEventSpecial.on.restore();
		domEventSpecial.off.restore();
	});

	it('adds on() and off() methods to a Vue component', () => {
		expect(component.on).to.be.a('function');
		expect(component.off).to.be.a('function');
	});

	it('passes through calls to on() to dom-event-special', () => {
		component.on(body, 'click', handler);
		expect(domEventSpecial.on.calledOnce).to.be.true;
	});

	it('binds handlers passed to on() to the component', () => {
		component.on(body, 'click', handler);
		expect(handler.bind.calledOnce).to.be.true;
		expect(handler.bind.calledWith(component)).to.be.true;
	});

	it('passes through calls to off() to dom-event-special', () => {
		component.off(body, 'click', handler);
		expect(domEventSpecial.off.calledOnce).to.be.true;
	});

	it('cleans up event listeners added via on() when the component is destroyed', () => {
		component.on(body, 'click', handler);
		component.$destroy();
		expect(domEventSpecial.off.calledOnce).to.be.true;
	});

	it('does not do anything if a component has no listeners attached when destroyed', () => {
		expect(() => { component.$destroy(); }).to.not.throw;	
	});
});
