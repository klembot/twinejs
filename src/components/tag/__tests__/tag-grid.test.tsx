import {faker} from '@faker-js/faker';
import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import { TagGrid, TagGridProps } from '../tag-grid';

describe('<TagGrid>', () => {
	function renderComponent(props?: Partial<TagGridProps>) {
		return render(
			<TagGrid tagColors={{}} tags={[faker.lorem.word()]} {...props} />
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

	it('gives itself a hidden class if there are no tags to show', () => {
		renderComponent({
			tags: ['tag-1']
		});
		expect(document.querySelector('.tag-grid')).toHaveClass('hidden');
	});

	it("doesn't give itself a hidden class if there are no tags to show", () => {
		renderComponent({
			tagColors: {'tag-1': 'red'},
			tags: ['tag-1']
		});
		expect(document.querySelector('.tag-grid')).not.toHaveClass('hidden');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
