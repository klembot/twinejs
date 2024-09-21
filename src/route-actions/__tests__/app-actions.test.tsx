import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {FakeStateProvider, FakeStateProviderProps} from '../../test-util';
import {AppActions} from '../app-actions';

describe('<AppActions>', () => {
	function renderComponent(
		contexts?: FakeStateProviderProps,
		history?: MemoryHistory
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider {...contexts}>
					<AppActions />
				</FakeStateProvider>
			</Router>
		);
	}

	it('displays a button that shows the preferences dialog', () => {
		renderComponent();
		expect(
			screen.queryByText('dialogs.appPrefs.title')
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('routeActions.app.preferences'));
		expect(screen.getByText('dialogs.appPrefs.title')).toBeInTheDocument();
	});

	it('displays a button that shows the about dialog', () => {
		renderComponent();
		expect(
			screen.queryByText('dialogs.aboutTwine.title')
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('routeActions.app.aboutApp'));
		expect(screen.getByText('dialogs.aboutTwine.title')).toBeInTheDocument();
	});

	it('displays a button that shows the story formats dialog', () => {
		renderComponent();
		expect(
			screen.queryByText('dialogs.storyFormats.title')
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('routeActions.app.storyFormats'));
		expect(screen.getByText('dialogs.storyFormats.title')).toBeInTheDocument();
	});

	it('displays a button that allows users to report bugs', () => {
		const openSpy = jest
			.spyOn(window, 'open')
			.mockReturnValue(undefined as any);

		renderComponent();
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('routeActions.app.reportBug'));
		expect(openSpy.mock.calls).toEqual([
			['https://twinery.org/2bugs', '_blank']
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
