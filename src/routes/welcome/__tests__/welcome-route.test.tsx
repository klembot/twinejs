import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Helmet} from 'react-helmet';
import {Router} from 'react-router-dom';
import {PrefsContext, PrefsContextProps} from '../../../store/prefs';
import {fakePrefs} from '../../../test-util';
import {WelcomeRoute} from '../welcome-route';

describe('<WelcomeRoute>', () => {
	function renderComponent(
		history?: MemoryHistory,
		context?: Partial<PrefsContextProps>
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<PrefsContext.Provider
					value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context}}
				>
					<WelcomeRoute />
				</PrefsContext.Provider>
			</Router>
		);
	}

	it('sets the document title', () => {
		renderComponent();
		expect(Helmet.peek().title).toBe('routes.welcome.greetingTitle');
	});

	it('sends users to the / route and records that the route has been seen when the user skips the onboarding', () => {
		const dispatch = jest.fn();
		const history = createMemoryHistory({initialEntries: ['/somewhere-else']});

		renderComponent(history, {dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		expect(history.location.pathname).toBe('/somewhere-else');
		fireEvent.click(screen.getByText('common.skip'));
		expect(history.location.pathname).toBe('/');
		expect(dispatch.mock.calls).toEqual([
			[{type: 'update', name: 'welcomeSeen', value: true}]
		]);
	});

	it('sends users to the / route and records that the route has been seen after clicking through all cards', () => {
		const dispatch = jest.fn();
		const history = createMemoryHistory({initialEntries: ['/somewhere-else']});

		renderComponent(history, {dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		expect(history.location.pathname).toBe('/somewhere-else');

		fireEvent.click(screen.getByText('routes.welcome.tellMeMore'));

		while (!screen.queryByText('routes.welcome.gotoStoryList')) {
			const nexts = screen.getAllByText('common.next');

			fireEvent.click(nexts[nexts.length - 1]);
		}

		fireEvent.click(screen.getByText('routes.welcome.gotoStoryList'));
		expect(history.location.pathname).toBe('/');
		expect(dispatch.mock.calls).toEqual([
			[{type: 'update', name: 'welcomeSeen', value: true}]
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
