import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import ImageButton from '../image-button';
import {rules} from '../../../test-utils/axe';

describe('<image-button>', () => {
	it('translates the label prop', () =>
		expect(mount(ImageButton, {propsData: {label: 'mock-label'}}).text()).toBe(
			'$t: mock-label'
		));

	it('displays slotted content as-is', () =>
		expect(
			mount(ImageButton, {slots: {default: 'mock-slot-content'}}).text()
		).toBe('mock-slot-content'));

	it('emits click events when clicked', () => {
		const wrapper = mount(ImageButton);

		wrapper.get('button').trigger('click');
		expect(wrapper.emitted().click).toEqual([[]]);
	});

	it('is accessible', async () =>
		expect(
			await axe(mount(ImageButton, {propsData: {label: 'mock-label'}}).html(), {
				rules
			})
		).toHaveNoViolations());
});
