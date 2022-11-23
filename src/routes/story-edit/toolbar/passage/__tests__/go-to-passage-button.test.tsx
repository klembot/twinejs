import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	GoToPassageButton,
	GoToPassageButtonProps
} from '../go-to-passage-button';

describe('GoToPassageButton', () => {
	function renderComponent(props?: Partial<GoToPassageButtonProps>) {
		return render(
			<GoToPassageButton onOpenFuzzyFinder={jest.fn()} {...props} />
		);
	}

	it('calls the onOpenFuzzyFinder prop when clicked', () => {
		const onOpenFuzzyFinder = jest.fn();

		renderComponent({onOpenFuzzyFinder});
		expect(onOpenFuzzyFinder).not.toBeCalled();
		fireEvent.click(
			screen.getByRole('button', {name: 'routes.storyEdit.toolbar.goTo'})
		);
		expect(onOpenFuzzyFinder).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
