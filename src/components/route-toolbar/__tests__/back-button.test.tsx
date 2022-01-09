import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {BackButton} from '../back-button';

describe('<BackButton>', () => {
	function renderComponent(history?: MemoryHistory) {
		return render(
			<Router
				history={
					history ?? createMemoryHistory({initialEntries: ['/somewhere']})
				}
			>
				<BackButton />
			</Router>
		);
	}

	it('displays nothing if on the story list route', () => {
		renderComponent(createMemoryHistory({initialEntries: ['/']}));
		expect(document.body.textContent).toBe('');
		renderComponent(createMemoryHistory({initialEntries: ['/stories']}));
		expect(document.body.textContent).toBe('');
	});

	// Problems using memory history for this.

	it.todo(
		'displays a button that goes back in history if history contains previous entries'
	);

	it('displays a button that navigates to the story list if there are no previous routes', () => {
		const history = createMemoryHistory({initialEntries: ['/stories/123']});

		renderComponent(history);
		fireEvent.click(screen.getByRole('button'));
		expect(history.location.pathname).toBe('/');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
