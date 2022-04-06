import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Dialogs} from '../dialogs';
import {DialogsContext, DialogsContextProps} from '../dialogs-context';

const MockComponent: React.FC<{collapsed?: boolean}> = ({
	children,
	collapsed
}) => (
	<div data-testid="mock-component" data-collapsed={collapsed}>
		{children}
	</div>
);

describe('<Dialogs>', () => {
	function renderComponent(context?: Partial<DialogsContextProps>) {
		return render(
			<DialogsContext.Provider
				value={{dialogs: [], dispatch: jest.fn(), ...context}}
			>
				<Dialogs />
			</DialogsContext.Provider>
		);
	}

	it('renders all dialogs in context', () => {
		renderComponent({
			dialogs: [
				{
					collapsed: false,
					component: MockComponent,
					props: {children: 'mock child 1'}
				},
				{
					collapsed: false,
					component: MockComponent,
					props: {children: 'mock child 2'}
				}
			]
		});

		expect(screen.getByText('mock child 1')).toBeInTheDocument();
		expect(screen.getByText('mock child 2')).toBeInTheDocument();
	});

	it('sets the collapsed prop on the dialog component', () => {
		renderComponent({
			dialogs: [
				{
					collapsed: true,
					component: MockComponent,
					props: {children: 'mock child 1'}
				}
			]
		});

		expect(screen.getByTestId('mock-component').dataset.collapsed).toBe('true');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
