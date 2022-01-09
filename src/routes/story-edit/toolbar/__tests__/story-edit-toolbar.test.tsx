import {act, render, screen} from '@testing-library/react';
import {createMemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {useStoriesContext} from '../../../../store/stories';
import {FakeStateProvider} from '../../../../test-util';
import {StoryEditToolbar} from '../story-edit-toolbar';

const TestStoryEditToolbar = () => {
	const {stories} = useStoriesContext();

	return (
		<StoryEditToolbar
			getCenter={() => ({left: 0, top: 0})}
			story={stories[0]}
		/>
	);
};

describe('<StoryEditToolbar>', () => {
	async function renderComponent() {
		const result = render(
			<Router history={createMemoryHistory()}>
				<FakeStateProvider>
					<TestStoryEditToolbar />
				</FakeStateProvider>
			</Router>
		);

		await act(() => Promise.resolve());
		return result;
	}

	it('displays a Passage tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.passage')).toBeInTheDocument();
	});

	it('displays a Story tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.story')).toBeInTheDocument();
	});

	it('displays a Build tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.build')).toBeInTheDocument();
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
