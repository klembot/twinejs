import {faker} from '@faker-js/faker';
import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {TagButton, TagButtonProps} from '../tag-button';

jest.mock('../../control/menu-button');

describe('<TagButton>', () => {
	function renderComponent(props?: Partial<TagButtonProps>) {
		return render(
			<TagButton
				name={faker.lorem.word()}
				onChangeColor={jest.fn()}
				onRemove={jest.fn()}
				{...props}
			/>
		);
	}

	it('displays the tag name', () => {
		renderComponent({name: 'tag-name'});
		expect(screen.getByTestId('mock-menu-button-tag-name')).toBeInTheDocument();
	});

	it('disables the button if the disabled prop is set', () => {
		renderComponent({disabled: true, name: 'tag-name'});
		expect(
			screen.getByTestId('mock-menu-button-tag-name').dataset.disabled
		).toBe('true');
	});

	it("enables the button if the disabled prop isn't set", () => {
		renderComponent({name: 'tag-name'});
		expect(
			screen.getByTestId('mock-menu-button-tag-name').dataset.disabled
		).toBeUndefined();
	});

	it('calls the onChangeColor prop when the color of the tag is changed', () => {
		const onChangeColor = jest.fn();

		renderComponent({onChangeColor});
		expect(onChangeColor).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('colors.red'));
		expect(onChangeColor.mock.calls).toEqual([['red']]);
	});

	it('calls the onRemove prop when the tag is removed', () => {
		const onRemove = jest.fn();

		renderComponent({onRemove});
		expect(onRemove).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.remove'));
		expect(onRemove).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
