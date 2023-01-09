import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FuzzyFinder, FuzzyFinderProps} from '../fuzzy-finder';

describe('FuzzyFinder', () => {
	function renderComponent(props?: Partial<FuzzyFinderProps>) {
		return render(
			<FuzzyFinder
				noResultsText="mock-no-results"
				onChangeSearch={jest.fn()}
				onClose={jest.fn()}
				onSelectResult={jest.fn()}
				prompt="mock-prompt"
				results={[{detail: 'result-1-detail', heading: 'result-2-heading'}]}
				search="mock-search"
				{...props}
			/>
		);
	}

	it('displays a prompt', () => {
		renderComponent({prompt: 'test-prompt'});
		expect(screen.getByText('test-prompt')).toBeInTheDocument();
	});

	it('displays a text field with the search prop as value', () => {
		renderComponent({search: 'test-search'});
		expect(screen.getByRole('textbox')).toHaveValue('test-search');
	});

	// jsdom doesn't seem to implement focus in a way that works for these tests.
	it.todo('focuses the text field when initially mounted');
	it.todo('provides keyboard shortcuts');

	it('calls the onChangeSearch prop when the text field is changed', () => {
		const onChangeSearch = jest.fn();

		renderComponent({onChangeSearch});
		expect(onChangeSearch).not.toBeCalled();
		fireEvent.change(screen.getByRole('textbox'), {
			target: {value: 'test-change'}
		});
		expect(onChangeSearch.mock.calls).toEqual([['test-change']]);
	});

	it('displays a close button which calls the onClose prop', () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toBeCalled();
		fireEvent.click(screen.getByRole('button', {name: 'Close'}));
		expect(onClose).toBeCalledTimes(1);
	});

	it('displays a result for every entry in the results prop', () => {
		renderComponent({
			results: [
				{detail: 'test-detail-1', heading: 'test-heading-1'},
				{detail: 'test-detail-2', heading: 'test-heading-2'}
			]
		});

		expect(screen.getByText('test-detail-1')).toBeInTheDocument();
		expect(screen.getByText('test-detail-2')).toBeInTheDocument();
	});

	it('displays the noResultsText prop if there are no results', () => {
		renderComponent({
			noResultsText: 'test-no-results',
			results: []
		});
		expect(screen.getByText('test-no-results')).toBeInTheDocument();
	});

	it("doesn't display the noResultsText prop if there are results", () => {
		renderComponent({
			noResultsText: 'test-no-results',
			results: [{detail: 'test-detail-1', heading: 'test-heading-1'}]
		});
		expect(screen.queryByText('test-no-results')).not.toBeInTheDocument();
	});

	it('calls the onSelectResult prop with the array index when a result is clicked', () => {
		const onSelectResult = jest.fn();

		renderComponent({
			onSelectResult,
			results: [{detail: 'test-detail-1', heading: 'test-heading-1'}]
		});
		expect(onSelectResult).not.toBeCalled();
		fireEvent.click(screen.getByText('test-detail-1'));
		expect(onSelectResult.mock.calls).toEqual([[0]]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
