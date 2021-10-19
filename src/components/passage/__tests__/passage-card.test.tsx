import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../test-util';
import {PassageCard, PassageCardProps} from '../passage-card';

jest.mock('../../tag/tag-stripe');

describe('<PassageCard>', () => {
	function renderComponent(props?: Partial<PassageCardProps>) {
		return render(
			<PassageCard
				onDeselect={jest.fn()}
				onEdit={jest.fn()}
				onSelect={jest.fn()}
				passage={fakePassage()}
				tagColors={{}}
				zoom={1}
				{...props}
			/>
		);
	}

	it('displays the passage name', () => {
		const passage = fakePassage();

		renderComponent({passage});
		expect(screen.getByText(passage.name)).toBeInTheDocument();
	});

	it('displays an excerpt of the passage text', () => {
		const passage = fakePassage({text: "short text that won't be truncated"});

		renderComponent({passage});
		expect(screen.getByText(passage.text)).toBeInTheDocument();
	});

	it('displays a <TagStripe> of passage tags', () => {
		const passage = fakePassage({tags: ['mock-tag-1', 'mock-tag-2']});

		renderComponent({passage});
		expect(screen.getByTestId('mock-tag-stripe')).toHaveTextContent(
			'mock-tag-1 mock-tag-2'
		);
	});

	it('positions the card based on the passage props', () => {
		const passage = fakePassage({left: 200, top: 400});

		renderComponent({passage, zoom: 1.5});

		const style = window.getComputedStyle(
			document.querySelector('.passage-card')!
		);

		// Zoom does not change positioning. This is handled by <PassageMap>
		// instead.
		expect(style.getPropertyValue('left')).toBe('200px');
		expect(style.getPropertyValue('top')).toBe('400px');
	});

	it('calls the onEdit prop when the card is double-clicked', () => {
		const onEdit = jest.fn();
		const passage = fakePassage();

		renderComponent({onEdit, passage});
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.dblClick(screen.getByText(passage.name));
		expect(onEdit.mock.calls).toEqual([[passage]]);
	});

	it('calls the onSelect prop when the card is clicked when unselected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: false});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name));
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it('calls neither onDeselect or onSelect props when the card is clicked when selected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: true});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name));
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('calls the onDeselect prop when the card is clicked with the shift or control key held and the passage is selected', () => {
		['ctrlKey', 'shiftKey'].forEach(key => {
			const onDeselect = jest.fn();
			const onSelect = jest.fn();
			const passage = fakePassage({selected: true});

			renderComponent({onDeselect, onSelect, passage});
			expect(onDeselect).not.toHaveBeenCalled();
			expect(onSelect).not.toHaveBeenCalled();
			fireEvent.mouseDown(screen.getByText(passage.name), {[key]: true});
			expect(onDeselect).toHaveBeenCalledTimes(1);
			expect(onSelect).not.toHaveBeenCalled();
		});
	});

	it('calls the onSelect prop with a nonexclusive argument when the card is clicked with the control key held and the passage is unselected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: false});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name), {ctrlKey: true});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect.mock.calls).toEqual([[passage, false]]);
	});

	it.todo('passes through drag events');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
