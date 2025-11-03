import {faker} from '@faker-js/faker';
import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {TagStripe, TagStripeProps} from '../tag-stripe';

describe('<TagStripe>', () => {
	function renderComponent(props?: Partial<TagStripeProps>) {
		return render(
			<TagStripe tagColors={{}} tags={[faker.lorem.word()]} {...props} />
		);
	}

	it('displays an element for every tag that has a color', () => {
		renderComponent({
			tagColors: {'tag-1': 'red', 'tag-2': 'blue'},
			tags: ['tag-1', 'tag-2']
		});
		expect(screen.getByTitle('tag-1')).toBeInTheDocument();
		expect(screen.getByTitle('tag-2')).toBeInTheDocument();
	});

	it('skips tags without a color', () => {
		renderComponent({
			tagColors: {'tag-1': 'red', 'tag-2': 'blue'},
			tags: ['tag-1', 'tag-2', 'tag-3']
		});
		expect(screen.queryByTitle('tag-3')).not.toBeInTheDocument();
		expect(screen.getByTitle('tag-1')).toBeInTheDocument();
		expect(screen.getByTitle('tag-2')).toBeInTheDocument();
	});


	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
