import {mount, shallowMount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import IconButton from '../icon-button';
import {rules} from '../../../test-utils/axe';

describe('<icon-button>', () => {
	it('translates the label prop', () =>
		expect(mount(IconButton, {propsData: {label: 'mock-label'}}).text()).toBe(
			'$t: mock-label'
		));

	it('displays slotted content as-is', () =>
		expect(
			mount(IconButton, {slots: {default: 'mock-slot-content'}}).text()
		).toBe('mock-slot-content'));

	it('sets CSS classes on its button based on the type property', async () => {
		const wrapper = mount(IconButton, {propsData: {type: 'primary'}});

		expect(wrapper.get('.type-primary').exists()).toBe(true);
		await wrapper.setProps({type: 'create'});
		expect(wrapper.get('.type-create').exists()).toBe(true);
		await wrapper.setProps({type: 'danger'});
		expect(wrapper.get('.type-danger').exists()).toBe(true);
	});

	it('displays the icon as specified', () => {
		const wrapper = shallowMount(IconButton, {propsData: {icon: 'check'}});
		const icon = wrapper.findComponent({name: 'icon-image'});

		expect(icon.props().name).toBe('check');
	});

	it('emits click events when clicked', () => {
		const wrapper = mount(IconButton);

		wrapper.get('button').trigger('click');
		expect(wrapper.emitted().click).toEqual([[]]);
	});

	it.todo(
		'stops propagation on click events with the stopClickPropagation prop'
	);

	it.todo(
		'prevents the event default of click events with the preventClickDefault prop'
	);

	it('is accessible', async () =>
		expect(
			await axe(mount(IconButton, {propsData: {label: 'mock-label'}}).html(), {
				rules
			})
		).toHaveNoViolations());
});
