import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsState} from '../../../store/prefs';
import {FakeStateProvider} from '../../../test-util';
import {Dialogs} from '../dialogs';
import {DialogsContext, DialogsContextProps} from '../dialogs-context';

const MockComponent: React.FC<{
	collapsed?: boolean;
	highlighted?: boolean;
	maximized?: boolean;
}> = ({children, collapsed, highlighted, maximized}) => (
	<div
		data-testid="mock-component"
		data-collapsed={collapsed}
		data-highlighted={highlighted}
		data-maximized={maximized}
	>
		{children}
	</div>
);

describe('<Dialogs>', () => {
	function renderComponent(
		context?: Partial<DialogsContextProps>,
		prefsContext?: Partial<PrefsState>
	) {
		return render(
			<FakeStateProvider prefs={prefsContext}>
				<DialogsContext.Provider
					value={{dialogs: [], dispatch: jest.fn(), ...context}}
				>
					<Dialogs />
				</DialogsContext.Provider>
			</FakeStateProvider>
		);
	}

	it('renders all dialogs in context', () => {
		renderComponent({
			dialogs: [
				{
					collapsed: false,
					component: MockComponent,
					highlighted: false,
					maximized: false,
					props: {children: 'mock child 1'}
				},
				{
					collapsed: false,
					component: MockComponent,
					highlighted: false,
					maximized: false,
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
					highlighted: false,
					maximized: false,
					props: {children: 'mock child 1'}
				}
			]
		});

		expect(screen.getByTestId('mock-component').dataset.collapsed).toBe('true');
	});

	it('sets the highlighted prop on the dialog component', () => {
		renderComponent({
			dialogs: [
				{
					collapsed: true,
					component: MockComponent,
					highlighted: true,
					maximized: false,
					props: {children: 'mock child 1'}
				}
			]
		});

		expect(screen.getByTestId('mock-component').dataset.highlighted).toBe(
			'true'
		);
	});

	it('sets the maximized prop on the dialog component', () => {
		renderComponent({
			dialogs: [
				{
					collapsed: true,
					component: MockComponent,
					highlighted: false,
					maximized: true,
					props: {children: 'mock child 1'}
				}
			]
		});

		expect(screen.getByTestId('mock-component').dataset.maximized).toBe('true');
	});

	// Using screen.debug() doesn't seem to show the padding-left style. Maybe a
	// gap in jsdom?

	it.skip('renders unmaximized dialogs at the width given by the dialogsWidth pref', () => {
		const dialogWidth = Math.random() * 1000;

		renderComponent(undefined, {dialogWidth});
		screen.debug();
		expect(
			document.querySelector<HTMLDivElement>('.dialogs')?.style.paddingLeft
		).toBe(`${dialogWidth}px`);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
