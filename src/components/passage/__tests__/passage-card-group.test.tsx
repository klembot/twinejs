import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../test-util';
import {PassageCardGroup, PassageCardGroupProps} from '../passage-card-group';

jest.mock('../passage-card');
jest.mock('react-transition-group');

describe('<PassageCardGroup>', () => {
	function renderComponent(props?: Partial<PassageCardGroupProps>) {
		return render(
			<PassageCardGroup
				onDeselect={jest.fn()}
				onEdit={jest.fn()}
				passages={[fakePassage(), fakePassage()]}
				onSelect={jest.fn()}
				tagColors={{}}
				zoom={1}
				{...props}
			/>
		);
	}

	it('renders a <PassageCard> for every passage in the passages prop', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages});
		expect(
			screen.getByTestId(`mock-passage-card-${passages[0].name}`)
		).toBeInTheDocument();
	});

	it.todo('passes through drag-related props');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
