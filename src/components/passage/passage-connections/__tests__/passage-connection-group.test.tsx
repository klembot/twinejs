import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {
	PassageConnectionGroup,
	PassageConnectionGroupProps
} from '../passage-connection-group';

jest.mock('../broken-connection');
jest.mock('../passage-connection');
jest.mock('../self-connection');

describe('<PassageConnectionGroup>', () => {
	function renderComponent(props?: Partial<PassageConnectionGroupProps>) {
		const broken = new Set([fakePassage()]);
		const connections = new Map();
		const self = new Set([fakePassage()]);

		connections.set(fakePassage(), new Set([fakePassage()]));

		return render(
			<svg>
				<PassageConnectionGroup
					broken={broken}
					connections={connections}
					offset={{left: 0, top: 0}}
					self={self}
					{...props}
				/>
			</svg>
		);
	}

	it('renders a <BrokenConnection> for every broken connection', () => {
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		renderComponent({broken: new Set([passage1, passage2])});
		expect(
			screen.getByTestId(`mock-broken-connection-${passage1.name}`)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(`mock-broken-connection-${passage2.name}`)
		).toBeInTheDocument();
	});

	it('renders a <SelfConnection> for every self connection', () => {
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		renderComponent({self: new Set([passage1, passage2])});
		expect(
			screen.getByTestId(`mock-self-connection-${passage1.name}`)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(`mock-self-connection-${passage2.name}`)
		).toBeInTheDocument();
	});

	it('renders a <PassageConnection> for every passage connection', () => {
		const passage1 = fakePassage();
		const passage2 = fakePassage();
		const passage3 = fakePassage();
		const connections = new Map();

		connections.set(passage1, new Set([passage2, passage3]));
		connections.set(passage2, new Set([passage1]));
		renderComponent({connections});
		expect(
			screen.getByTestId(
				`mock-passage-connection-${passage1.name}-${passage2.name}`
			)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(
				`mock-passage-connection-${passage1.name}-${passage3.name}`
			)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(
				`mock-passage-connection-${passage2.name}-${passage1.name}`
			)
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
