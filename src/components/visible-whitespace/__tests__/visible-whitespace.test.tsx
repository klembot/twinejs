import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {VisibleWhitespace, VisibleWhitespaceProps} from '../visible-whitespace';

describe('<VisibleWhitespace>', () => {
	function renderComponent(props?: Partial<VisibleWhitespaceProps>) {
		return render(<VisibleWhitespace value="mock-value" {...props} />);
	}

	it('renders SVG images for each leading and trailing space in the value prop', () => {
		renderComponent({value: ' \tvalue\t '});

		const span = document.querySelector('.visible-whitespace');

		expect(span).not.toBeNull();
		expect(span!.children.length).toBe(4);
		expect(span!.childNodes[0].nodeName).toBe('svg');
		expect(span!.childNodes[1].nodeName).toBe('svg');
		expect(span!.childNodes[2].textContent).toBe('value');
		expect(span!.childNodes[3].nodeName).toBe('svg');
		expect(span!.childNodes[4].nodeName).toBe('svg');
	});

	it("doesn't render SVG images for whitespace inside the value", () => {
		renderComponent({value: 'val \tue'});
		expect(document.body.querySelector('svg')).toBeNull();
		expect(document.body).toHaveTextContent('val ue');
	});

	it('leaves strings without whitespace as-is', () => {
		renderComponent({value: 'val-ue'});
		expect(document.body).toHaveTextContent('val-ue');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
