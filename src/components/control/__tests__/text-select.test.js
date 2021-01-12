import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import TextSelect from '../text-select';
import {rules} from '../../../test-utils/axe';

function mountSelect(propsData, defaultSlot = 'mock-label') {
	return mount(TextSelect, {
		propsData: {
			options: [
				{label: 'mock-label1', value: 'mock-value1'},
				{label: 'mock-label2', value: 'mock-value2'}
			],
			value: 'mock-value1',
			...propsData
		},
		slots: {
			default: defaultSlot
		}
	});
}

describe('<text-select>', () => {
	it('uses the default slot as label', () =>
		/*
		Selector has to be specific because .text() gets the text of the options as
		well.
		*/
		expect(
			mountSelect({}, 'default slot')
				.get('label .label')
				.text()
		).toBe('default slot'));

	it('renders a select with options', () => {
		const wrapper = mountSelect();

		expect(wrapper.get('select').exists()).toBe(true);

		const options = wrapper.findAll('select option');

		expect(options.length).toBe(2);
		expect(options.at(0).text()).toBe('mock-label1');
		expect(options.at(0).attributes().value).toBe('mock-value1');
		expect(options.at(1).text()).toBe('mock-label2');
		expect(options.at(1).attributes().value).toBe('mock-value2');
	});

	it('selects the appropriate option based on the value prop', async () => {
		const wrapper = mountSelect({value: 'mock-value2'});

		expect(wrapper.get('select option:checked').attributes().value).toBe(
			'mock-value2'
		);
		await wrapper.setProps({value: 'mock-value1'});
		expect(wrapper.get('select option:checked').attributes().value).toBe(
			'mock-value1'
		);
	});

	it('emits change events when the user selects an option', async () => {
		const wrapper = mountSelect();

		await wrapper.find('select option[value="mock-value2"]').setSelected();
		expect(wrapper.emitted().change).toEqual([['mock-value2']]);
	});

	it('sets CSS classes on its button based on the orientation property', async () => {
		const wrapper = mountSelect({orientation: 'horizontal'});

		expect(wrapper.get('.orientation-horizontal').exists()).toBe(true);
		await wrapper.setProps({orientation: 'vertical'});
		expect(wrapper.get('.orientation-vertical').exists()).toBe(true);
	});

	it('is accessible', async () =>
		expect(await axe(mountSelect().html(), {rules})).toHaveNoViolations());
});
