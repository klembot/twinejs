import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useDonationCheck} from '../../../store/prefs/use-donation-check';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../test-util';
import {InnerStoryListRoute} from '../story-list-route';

jest.mock('../toolbar/story-list-toolbar');
jest.mock('../story-cards');
jest.mock('../../../store/prefs/use-donation-check');
jest.mock('../../../components/error/safari-warning-card');

describe('<StoryListRoute>', () => {
	const useDonationCheckMock = useDonationCheck as jest.Mock;

	beforeEach(() => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});
	});

	function renderComponent(contexts?: FakeStateProviderProps) {
		// Using the inner component so we can mock contexts around it.

		return render(
			<FakeStateProvider {...contexts}>
				<InnerStoryListRoute />
			</FakeStateProvider>
		);
	}

	it('displays the toolbar', () => {
		renderComponent();
		expect(screen.getByTestId('mock-story-list-toolbar')).toBeInTheDocument();
	});

	it('displays a warning for Safari users', () => {
		renderComponent();
		expect(screen.getByTestId('mock-safari-warning-card')).toBeInTheDocument();
	});

	it('displays story cards if there are stories in state', () => {
		renderComponent({stories: [fakeStory()]});
		expect(screen.getByTestId('mock-story-cards')).toBeInTheDocument();
	});

	it('displays a message if there are no stories in state', () => {
		renderComponent({stories: []});
		expect(screen.queryByTestId('mock-story-cards')).not.toBeInTheDocument();
		expect(screen.getByText('routes.storyList.noStories')).toBeInTheDocument();
	});

	it('displays a donation prompt if useDonationCheck() says it should be shown', () => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => true
		});

		renderComponent();
		expect(screen.getByText('dialogs.appDonation.title')).toBeInTheDocument();
	});

	it('does not display a donation prompt if useDonationCheck() says it should not be shown', () => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});

		renderComponent();
		expect(screen.queryByText('dialogs.appDonation.title')).not.toBeInTheDocument();
	});

	it.todo('publishes a story when a story card asks to be published');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
