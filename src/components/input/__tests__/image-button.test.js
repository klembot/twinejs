import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import {normal, withoutShadow} from '../__stories__/image-button.stories';

describe('<image-button>', () => {
	it('displays the text label', () => {
		expect(mount(normal()).text()).toBe('Hello');
		expect(mount(withoutShadow()).text()).toBe('Hello');
	});

	it('emits click events when clicked', () => {
		const clickSpy = jest.fn();
		const wrapper = mount({...normal(), methods: {onClick: clickSpy}});

		wrapper.find('button').trigger('click');
		expect(clickSpy).toHaveBeenCalledTimes(1);
		wrapper.find('button').trigger('click');
		expect(clickSpy).toHaveBeenCalledTimes(2);
	});

	it('is accessible', async () => {
		async function testAxe(func) {
			expect(await axe(mount(func()).html())).toHaveNoViolations();
		}

		const instances = [normal, withoutShadow];

		for (let i = 0; i < instances.length; i++) {
			await testAxe(instances[i]);
		}
	});
});
