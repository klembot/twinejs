import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {AddTagButton, AddTagButtonProps} from '../add-tag-button';

describe('<AddTagButton>', () => {
	function renderComponent(props?: Partial<AddTagButtonProps>) {
		return render(
			<AddTagButton
				assignedTags={[]}
				existingTags={[]}
				onAdd={jest.fn()}
				{...props}
			/>
		);
	}

	it('disables the button if the disabled prop is set', () => {
		renderComponent({disabled: true});
		expect(screen.getByText('common.tag')).toBeDisabled();
	});

	it('uses the icon prop if set', () => {
		renderComponent({icon: 'mock-icon'});
		expect(screen.getByText('mock-icon')).toBeInTheDocument();
	});

	it('uses the label prop if set', () => {
		renderComponent({label: 'mock-label'});
		expect(
			screen.getByRole('button', {name: 'mock-label'})
		).toBeInTheDocument();
	});

	it('calls the onAdd prop when an existing tag is added', async () => {
		const onAdd = jest.fn();

		renderComponent({onAdd, existingTags: ['existing-tag']});
		expect(onAdd).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.tag'));
		await act(() => Promise.resolve()); // Wait for <CardButton> to open
		fireEvent.change(
			screen.getByRole('combobox', {name: 'components.addTagButton.addLabel'}),
			{target: {value: 'existing-tag'}}
		);
		fireEvent.click(screen.getByText('common.add'));
		expect(onAdd.mock.calls).toEqual([['existing-tag']]);
	});

	it('calls the onAdd prop when a new tag is added', () => {
		const onAdd = jest.fn();

		renderComponent({onAdd});
		expect(onAdd).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.tag'));
		fireEvent.change(
			screen.getByRole('combobox', {name: 'components.addTagButton.addLabel'}),
			{target: {value: ''}}
		);
		fireEvent.change(
			screen.getByLabelText('components.addTagButton.tagNameLabel'),
			{target: {value: 'new-tag'}}
		);
		fireEvent.change(
			screen.getByLabelText('components.addTagButton.tagColorLabel'),
			{target: {value: 'red'}}
		);
		fireEvent.click(screen.getByText('common.add'));
		expect(onAdd.mock.calls).toEqual([['new-tag', 'red']]);
	});

	it('prevents new tags from containing spaces', () => {
		const onAdd = jest.fn();

		renderComponent({onAdd});
		expect(onAdd).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.tag'));
		fireEvent.change(
			screen.getByRole('combobox', {name: 'components.addTagButton.addLabel'}),
			{target: {value: ''}}
		);
		fireEvent.change(
			screen.getByLabelText('components.addTagButton.tagNameLabel'),
			{target: {value: 'new tag'}}
		);
		fireEvent.change(
			screen.getByLabelText('components.addTagButton.tagColorLabel'),
			{target: {value: 'red'}}
		);
		fireEvent.click(screen.getByText('common.add'));
		expect(onAdd.mock.calls).toEqual([['new-tag', 'red']]);
	});

	it('prevents adding a pre-existing tag', async () => {
		const onAdd = jest.fn();

		renderComponent({onAdd, existingTags: ['existing-tag']});
		expect(onAdd).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.tag'));
		fireEvent.change(
			screen.getByRole('combobox', {name: 'components.addTagButton.addLabel'}),
			{target: {value: ''}}
		);
		fireEvent.change(
			screen.getByLabelText('components.addTagButton.tagNameLabel'),
			{target: {value: 'existing-tag'}}
		);
		fireEvent.click(screen.getByText('common.add'));
		await act(() => Promise.resolve());
		expect(onAdd).not.toHaveBeenCalled();
		expect(
			screen.getByText('components.addTagButton.alreadyAdded')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
