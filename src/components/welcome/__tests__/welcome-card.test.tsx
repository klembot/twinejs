import {fireEvent, render, screen} from '@testing-library/react';
import {lorem} from 'faker';
import {axe} from 'jest-axe';
import * as React from 'react';
import {WelcomeCard, WelcomeCardProps} from '../welcome-card';

describe('<WelcomeCard>', () => {
	function renderComponent(props?: Partial<WelcomeCardProps>) {
		return render(
			<WelcomeCard
				nextLabel={lorem.words(3)}
				onNext={jest.fn()}
				onSkip={jest.fn()}
				showSkip={false}
				title={lorem.words(5)}
				{...props}
			>
				mock-children
			</WelcomeCard>
		);
	}

	it('displays its children', () => {
		renderComponent();
		expect(screen.getByText('mock-children')).toBeInTheDocument();
	});

	it('displays the title prop', () => {
		renderComponent({title: 'test title'});
		expect(screen.getByText('test title')).toBeInTheDocument();
	});

	it('displays a button that calls onNext', () => {
		const onNext = jest.fn();

		renderComponent({
			onNext,
			nextLabel: 'test next button'
		});

		expect(onNext).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('test next button'));
		expect(onNext).toBeCalledTimes(1);
	});

	it('displays a skip button that calls onSkip if the showSkip prop is true', () => {
		const onSkip = jest.fn();

		renderComponent({onSkip, showSkip: true});
		expect(onSkip).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.skip'));
		expect(onSkip).toBeCalledTimes(1);
	});

	it("doesn't display a skip button if the showSkip prop is false", () => {
		renderComponent({showSkip: false});
		expect(screen.queryByText('common.skip')).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
