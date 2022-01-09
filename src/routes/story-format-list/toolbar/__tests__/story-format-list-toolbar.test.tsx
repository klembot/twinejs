import {act, render, screen} from '@testing-library/react';
import {createMemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {FakeStateProvider} from '../../../../test-util';
import {StoryFormatListToolbar} from '../story-format-list-toolbar';

describe('<StoryFormatListToolbar>', () => {
	async function renderComponent() {
		const result = render(
			<Router history={createMemoryHistory()}>
				<FakeStateProvider>
					<StoryFormatListToolbar selectedFormats={[]} />
				</FakeStateProvider>
			</Router>
		);

		await act(() => Promise.resolve());
		return result;
	}

	it('displays a Formats tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.storyFormat')).toBeInTheDocument();
	});

	it('displays a View tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.view')).toBeInTheDocument();
	});

	it('displays an app tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.appName')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
