import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {RouteToolbar, RouteToolbarProps} from '../route-toolbar';

jest.mock('../back-button');

describe('<RouteToolbar>', () => {
	function renderComponent(props?: Partial<RouteToolbarProps>) {
		return render(
			<RouteToolbar
				tabs={{'test-tab': <div>test tab content</div>}}
				{...props}
			/>
		);
	}

	it('displays a back button', () => {
		renderComponent();
		expect(screen.getByTestId('mock-back-button')).toBeInTheDocument();
	});

	it('displays tabs defined by the tabs prop', () => {
		renderComponent({
			tabs: {
				'mock-tab-1': <div data-testid="mock-tab-content-1" />,
				'mock-tab-2': <div data-testid="mock-tab-content-2" />
			}
		});

		expect(screen.getAllByRole('tab').length).toBe(2);
		expect(screen.getByTestId('mock-tab-content-1')).toBeInTheDocument();
		expect(screen.queryByTestId('mock-tab-content-2')).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('mock-tab-2'));
		expect(screen.queryByTestId('mock-tab-content-1')).not.toBeInTheDocument();
		expect(screen.getByTestId('mock-tab-content-2')).toBeInTheDocument();
	});

	it('displays a help button that opens the URL given in helpUrl prop in a new tab', () => {
		const openSpy = jest.spyOn(window, 'open').mockReturnValue();

		renderComponent({helpUrl: 'mock-help-url'});
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'common.help'}));
		expect(openSpy.mock.calls).toEqual([['mock-help-url', '_blank']]);
	});

	it('displays pinned controls', () => {
		renderComponent({pinnedControls: <div data-testid="pinned-control" />});
		expect(screen.getByTestId('pinned-control')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
