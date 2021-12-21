import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../../../test-util';
import {FindReplaceButton} from '../find-replace-button';

const TestFindReplaceButton: React.FC = () => {
	const {stories} = useStoriesContext();

	return <FindReplaceButton story={stories[0]} />;
};

describe('<FindReplaceButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestFindReplaceButton />
			</FakeStateProvider>
		);
	}

	it('opens the find/replace dialog when clicked', () => {
		renderComponent();
		fireEvent.click(
			screen.getByText('routes.storyEdit.toolbar.findAndReplace')
		);
		expect(screen.getByText('dialogs.storySearch.title')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
