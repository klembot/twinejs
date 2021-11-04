import {render, screen} from '@testing-library/react';
import {lorem} from 'faker';
import {axe} from 'jest-axe';
import * as React from 'react';
import {TagStripe, TagStripeProps} from '../tag-stripe';

describe('<TagStripe>', () => {
	function renderComponent(props?: Partial<TagStripeProps>) {
		return render(
			<TagStripe tagColors={{}} tags={[lorem.word()]} {...props} />
		);
	}

	it('displays an element for every tag', () => {
		renderComponent({tags: ['tag-1', 'tag-2']});
		expect(screen.getByTitle('tag-1')).toBeInTheDocument();
		expect(screen.getByTitle('tag-2')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
