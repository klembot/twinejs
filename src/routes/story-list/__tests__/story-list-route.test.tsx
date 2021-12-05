import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {AppDonationDialog} from '../../../dialogs';
import {useDonationCheck} from '../../../store/prefs/use-donation-check';
import {fakeStory} from '../../../test-util';
import {
	MockContextProvider,
	MockContextProviderProps
} from '../../../test-util/MockContextProvider';
import {InnerStoryListRoute} from '../story-list-route';

jest.mock('../top-bar/top-bar');
jest.mock('../story-cards');
jest.mock('../../../store/prefs/use-donation-check');
jest.mock('../../../components/safari-warning/safari-warning-card');

describe('<StoryListRoute>', () => {
	const useDonationCheckMock = useDonationCheck as jest.Mock;

	beforeEach(() => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});
	});

	function renderComponent(contexts?: MockContextProviderProps) {
		// Using the inner component so we can mock contexts around it.

		return render(
			<MockContextProvider {...contexts}>
				<InnerStoryListRoute />
			</MockContextProvider>
		);
	}

	it('displays the top bar', () => {
		renderComponent();
		expect(screen.getByTestId('mock-story-list-top-bar')).toBeInTheDocument();
	});

	it('displays a warning for Safari users', () => {
		renderComponent();
		expect(screen.getByTestId('mock-safari-warning-card')).toBeInTheDocument();
	});

	it('displays story cards if there are stories in state', () => {
		renderComponent({stories: {stories: [fakeStory()]}});
		expect(screen.getByTestId('mock-story-cards')).toBeInTheDocument();
	});

	it('displays a message if there are no stories in state', () => {
		renderComponent({stories: {stories: []}});
		expect(screen.queryByTestId('mock-story-cards')).not.toBeInTheDocument();
		expect(screen.getByText('routes.storyList.noStories')).toBeInTheDocument();
	});

	it('displays a donation prompt if useDonationCheck() says it should be shown', () => {
		const dispatch = jest.fn();

		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => true
		});

		renderComponent({dialogs: {dispatch}});
		expect(dispatch.mock.calls).toEqual([
			[{type: 'addDialog', component: AppDonationDialog}]
		]);
	});

	it('does not display a donation prompt if useDonationCheck() says it should not be shown', () => {
		const dispatch = jest.fn();

		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});

		renderComponent({dialogs: {dispatch}});
		expect(dispatch).not.toBeCalled();
	});

	it.todo('publishes a story when a story card asks to be published');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
