import {mount} from '@vue/test-utils';
import {axe} from 'jest-axe';
import {labeled, unlabeled} from '../__stories__/icon-image.stories';
import {rules} from '../../../test-utils/axe';

describe('<icon-image>', () => {
	it('displays an SVG element', () => {
		expect(mount(labeled()).find('svg')).not.toBeUndefined();
		expect(mount(unlabeled()).find('svg')).not.toBeUndefined();
	});

	it('is aria-hidden when unlabeled', () => {
		/* Attributes are always strings. */
		expect(mount(unlabeled()).attributes()['aria-hidden']).toBe('true');
	});

	it('is not aria-hidden when labelled', () => {
		const attrs = mount(labeled()).attributes();

		expect(attrs['aria-hidden']).toBeUndefined();
		expect(attrs['aria-label']).toBe('Enabled');
	});

	it('is accessible', async () => {
		async function testAxe(func) {
			expect(await axe(mount(func()).html(), {rules})).toHaveNoViolations();
		}

		const instances = [labeled, unlabeled];

		for (let i = 0; i < instances.length; i++) {
			await testAxe(instances[i]);
		}
	});
});
