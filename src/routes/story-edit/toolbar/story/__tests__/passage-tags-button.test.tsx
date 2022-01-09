import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../../../test-util';
import {PassageTagsButton} from '../passage-tags-button';

const TestPassageTagsButton: React.FC = () => {
	const {stories} = useStoriesContext();

	return <PassageTagsButton story={stories[0]} />;
};

describe('<PassageTagsButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestPassageTagsButton />
			</FakeStateProvider>
		);
	}

	it('opens the passage tags dialog when clicked', () => {
		renderComponent();
		fireEvent.click(screen.getByText('routes.storyEdit.toolbar.passageTags'));
		expect(screen.getByText('dialogs.passageTags.title')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
