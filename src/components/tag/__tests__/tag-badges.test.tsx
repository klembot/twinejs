import {faker} from '@faker-js/faker';
import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import { TagBadges, TagBadgesProps } from '../tag-badges';

describe('<TagBadges>', () => {
	function renderComponent(props?: Partial<TagBadgesProps>) {
		return render(
			<TagBadges tagColors={{}} tags={[faker.lorem.word()]} {...props} />
		);
	}

	it('displays an element for every tag, even those without a color', () => {
		renderComponent({
			tagColors: {'tag-1': 'red', 'tag-2': 'blue'},
			tags: ['tag-1', 'tag-2', 'tag-3']
		});
		expect(screen.getByText('tag-1')).toBeInTheDocument();
		expect(screen.getByText('tag-2')).toBeInTheDocument();
		expect(screen.getByText('tag-3')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
