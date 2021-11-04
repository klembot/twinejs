import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {
	PassageConnections,
	PassageConnectionsProps
} from '../passage-connections';

jest.mock('../../../../store/use-format-reference-parser');
jest.mock('../link-markers');
jest.mock('../start-connection');

describe('<PassageConnections>', () => {
	function renderComponent(props?: Partial<PassageConnectionsProps>) {
		const passage = fakePassage();

		return render(
			<PassageConnections
				formatName=""
				formatVersion=""
				offset={{left: 0, top: 0}}
				passages={[passage]}
				startPassageId={passage.id}
				{...props}
			/>
		);
	}

	it('renders a <LinkMarkers>', () => {
		renderComponent();
		expect(screen.getByTestId('mock-link-markers')).toBeInTheDocument();
	});

	it('renders a <StartConnection> for the start passage', () => {
		const passage = fakePassage();

		renderComponent({passages: [passage], startPassageId: passage.id});
		expect(
			screen.getByTestId(`mock-start-connection-${passage.name}`)
		).toBeInTheDocument();
	});

	it.todo('renders connections based on the built-in link parser');

	it.todo(
		'renders connections based on the story format reference parser, if it exists'
	);

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
