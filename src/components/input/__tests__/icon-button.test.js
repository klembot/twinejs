import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import {
	plain,
	plainSingle,
	primary,
	create,
	danger,
	iconOnly
} from '../__stories__/icon-button.stories';

describe('<icon-button>', () => {
	it('displays the text label', () => {
		expect(mount(plainSingle()).text()).toBe('Hello');
	});

	it('sets CSS classes on its button based on the type property', () => {
		function buttonHasClass(func, className) {
			return mount(func())
				.find('button')
				.element.classList.contains(className);
		}

		expect(buttonHasClass(primary, 'type-primary')).toBe(true);
		expect(buttonHasClass(create, 'type-create')).toBe(true);
		expect(buttonHasClass(danger, 'type-danger')).toBe(true);
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
		expect(clickSpy).toHaveBeenCalledTimes(1);
		wrapper.find('button').trigger('click');
		expect(clickSpy).toHaveBeenCalledTimes(2);
	});

	it.todo(
		'stops propagation on click events with the stopClickPropagation prop'
	);

	it.todo(
		'prevents the event default of click events with the preventClickDefault prop'
	);

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
