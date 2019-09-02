import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import {
	plain,
	primary,
	create,
	danger,
	iconOnly
} from '../__stories__/icon-button.stories';

describe('<icon-button>', () => {
	it('displays the text label', () => {
		expect(mount(plain()).text()).toBe('Hello');
	});

	it('sets CSS classes on its button based on the type property', () => {
		function buttonClass(func) {
			return mount(func()).find('button').element.className;
		}

		expect(buttonClass(plain)).toBe('');
		expect(buttonClass(primary)).toBe('primary');
		expect(buttonClass(create)).toBe('create');
		expect(buttonClass(danger)).toBe('danger');
	});

	// it.todo('displays the icon as specified');
	it('sets an ARIA label as specified', () => {
		expect(
			mount(iconOnly())
				.find('[aria-label]')
				.element.getAttribute('aria-label')
		).toBe('OK');
	});

	it('emits click events when clicked', () => {
		const clickSpy = jest.fn();
		const wrapper = mount({...plain(), methods: {onClick: clickSpy}});

		wrapper.find('button').trigger('click');
		expect(clickSpy).toBeCalledTimes(1);
		wrapper.find('button').trigger('click');
		expect(clickSpy).toBeCalledTimes(2);
	});

	it('is accessible', async () => {
		async function testAxe(func) {
			expect(await axe(mount(func()).html())).toHaveNoViolations();
		}

		const instances = [plain, primary, create, danger, iconOnly];

		for (let i = 0; i < instances.length; i++) {
			await testAxe(instances[i]);
		}
	});
});
