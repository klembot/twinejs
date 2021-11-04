import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {PassageMap, PassageMapProps} from '../passage-map';

jest.mock('../../../../store/use-format-reference-parser');
jest.mock('../../passage-connections/passage-connections');
jest.mock('../../passage-card-group');

describe('<PassageMap>', () => {
	function renderComponent(props?: Partial<PassageMapProps>) {
		const passages = [fakePassage(), fakePassage()];

		return render(
			<PassageMap
				formatName=""
				formatVersion=""
				onDeselect={jest.fn()}
				onDrag={jest.fn()}
				onEdit={jest.fn()}
				onSelect={jest.fn()}
				passages={passages}
				startPassageId={passages[0].id}
				tagColors={{}}
				zoom={1}
				{...props}
			/>
		);
	}

	it('renders a <PassageConnections> for the passages', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		expect(
			screen.getByTestId(
				`mock-passage-connections-${passages[0].name}-${passages[1].name}`
			)
		).toBeInTheDocument();
	});

	it('renders a <PassageCardGroup> for the passages', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		expect(
			screen.getByTestId(
				`mock-passage-card-group-${passages[0].name}-${passages[1].name}`
			)
		).toBeInTheDocument();
	});

	it('changes the offset on <PassageConnections> when a drag occurs', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		fireEvent.click(
			within(
				screen.getByTestId(
					`mock-passage-card-group-${passages[0].name}-${passages[1].name}`
				)
			).getByText('simulate drag')
		);

		const connections = screen.getByTestId(
			`mock-passage-connections-${passages[0].name}-${passages[1].name}`
		);

		expect(connections.dataset.offsetLeft).toBe('5');
		expect(connections.dataset.offsetTop).toBe('10');
	});

	it.todo('sets itself as larger than the passage cards it contains');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
