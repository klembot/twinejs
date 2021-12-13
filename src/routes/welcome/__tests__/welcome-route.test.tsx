import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Helmet} from 'react-helmet';
import {Router} from 'react-router-dom';
import {PrefsState} from '../../../store/prefs';
import {PrefInspector, FakeStateProvider} from '../../../test-util';
import {WelcomeRoute} from '../welcome-route';

describe('<WelcomeRoute>', () => {
	function renderComponent(
		history?: MemoryHistory,
		prefs?: Partial<PrefsState>
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider prefs={prefs}>
					<WelcomeRoute />
					<PrefInspector name="welcomeSeen" />
				</FakeStateProvider>
			</Router>
		);
	}

	it('sets the document title', () => {
		renderComponent();
		expect(Helmet.peek().title).toBe('routes.welcome.greetingTitle');
	});

	it('sends users to the / route and records that the route has been seen when the user skips the onboarding', () => {
		const history = createMemoryHistory({initialEntries: ['/somewhere-else']});

		renderComponent(history, {welcomeSeen: false});
		expect(history.location.pathname).toBe('/somewhere-else');
		fireEvent.click(screen.getByText('common.skip'));
		expect(history.location.pathname).toBe('/');
		expect(screen.getByTestId('pref-inspector-welcomeSeen')).toHaveTextContent(
			'true'
		);
	});

	it('sends users to the / route and records that the route has been seen after clicking through all cards', () => {
		const history = createMemoryHistory({initialEntries: ['/somewhere-else']});

		renderComponent(history, {welcomeSeen: false});
		expect(history.location.pathname).toBe('/somewhere-else');
		fireEvent.click(screen.getByText('routes.welcome.tellMeMore'));

		while (!screen.queryByText('routes.welcome.gotoStoryList')) {
			const nexts = screen.getAllByText('common.next');

			fireEvent.click(nexts[nexts.length - 1]);
		}

		fireEvent.click(screen.getByText('routes.welcome.gotoStoryList'));
		expect(history.location.pathname).toBe('/');
		expect(screen.getByTestId('pref-inspector-welcomeSeen')).toHaveTextContent(
			'true'
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
