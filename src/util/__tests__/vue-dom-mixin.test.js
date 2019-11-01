import Vue from 'vue';
import domEvents from '../vue-dom-mixin';

describe('dom-events Vue mixin', () => {
	const body = document.querySelector('body');

	let clickEvent = document.createEvent('MouseEvent');

	let handler, handlerCb, component;

	clickEvent.initMouseEvent(
		'click',
		true,
		true,
		window,
		1,
		0,
		0,
		0,
		0,
		false,
		false,
		false,
		false,
		0,
		null
	);

	beforeEach(() => {
		component = new Vue({mixins: [domEvents]});
		handler = {};
		handlerCb = jest.fn();
		handler.bind = jest.fn().mockReturnValue(handlerCb);
	});

	afterEach(() => {
		handler.bind.mockClear();
		handlerCb.mockClear();
	});

	test('adds on() and off() methods to a Vue component', () => {
		expect(typeof component.on).toBe('function');
		expect(typeof component.off).toBe('function');
	});

	test('adds event listeners with on()', () => {
		component.on(body, 'click', handler);
		body.dispatchEvent(clickEvent);
		expect(handlerCb).toHaveBeenCalledTimes(1);
	});

	test('binds handlers passed to on() to the component', () => {
		component.on(body, 'click', handler);
		expect(handler.bind).toHaveBeenCalledTimes(1);
		expect(handler.bind).toHaveBeenCalledWith(component);
	});

	test('removes event listeners with off()', () => {
		component.on(body, 'click', handler);
		component.off(body, 'click', handler);
		body.dispatchEvent(clickEvent);
		expect(handlerCb).not.toHaveBeenCalled();
	});

	test('cleans up event listeners added via on() when the component is destroyed', () => {
		component.on(body, 'click', handler);
		component.$destroy();
		body.dispatchEvent(clickEvent);
		expect(handlerCb).not.toHaveBeenCalled();
	});

	test('does not do anything if a component has no listeners attached when destroyed', () => {
		expect(() => {
			component.$destroy();
		}).not.toThrow();
	});

	test('partitions listeners for different component instances', () => {
		const comp = Vue.extend({mixins: [domEvents]});

		let comp1 = new comp();

		let comp2 = new comp();

		comp1.on(body, 'click', handler);
		comp2.on(body, 'click', handler);

		body.dispatchEvent(clickEvent);

		expect(handler.bind).toHaveBeenCalledTimes(2);
		expect(handlerCb).toHaveBeenCalledTimes(1);
	});
});
