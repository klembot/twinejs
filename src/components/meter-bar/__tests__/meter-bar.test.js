import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import {empty, half, full} from '../__stories__/meter-bar.stories';

describe('<meter-meter>', () => {
	it('changes appearance based on its percentage property', () => {
		const emptyHtml = mount(empty()).html();
		const halfHtml = mount(half()).html();
		const fullHtml = mount(full()).html();

		expect(emptyHtml).not.toBe(halfHtml);
		expect(emptyHtml).not.toBe(fullHtml);
		expect(halfHtml).not.toBe(fullHtml);
	});

	it('is accessible', async () => {
		async function testAxe(func) {
			expect(await axe(mount(func()).html())).toHaveNoViolations();
		}

		const instances = [empty, half, full];

		for (let i = 0; i < instances.length; i++) {
			await testAxe(instances[i]);
		}
	});
});
