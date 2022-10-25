import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FuzzyFinderResult,
	FuzzyFinderResultProps
} from '../fuzzy-finder-result';

describe('FuzzyFinderResult', () => {
	function renderComponent(props?: Partial<FuzzyFinderResultProps>) {
		return render(
			<FuzzyFinderResult
				detail="mock-detail"
				heading="mock-heading"
				onClick={jest.fn()}
				{...props}
			/>
		);
	}

	it('displays the heading', () => {
		renderComponent({heading: 'test-heading'});
		expect(screen.getByText('test-heading')).toBeInTheDocument();
	});

	it('displays the detail', () => {
		renderComponent({detail: 'test-detail'});
		expect(screen.getByText('test-detail')).toBeInTheDocument();
	});

	it('calls the onClick prop when the button is clicked', () => {
		const onClick = jest.fn();

		renderComponent({onClick});
		expect(onClick).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
