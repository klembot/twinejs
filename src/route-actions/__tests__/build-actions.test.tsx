import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Story} from '../../store/stories';
import {usePublishing} from '../../store/use-publishing';
import {useStoryLaunch} from '../../store/use-story-launch';
import {fakeStory} from '../../test-util';
import {BuildActions, BuildActionsProps} from '../build-actions';

jest.mock('../../store/use-publishing');
jest.mock('../../store/use-story-launch');
jest.mock('../../util/save-html');

describe('<BuildActions>', () => {
	const usePublishingMock = usePublishing as jest.Mock;
	const useStoryLaunchMock = useStoryLaunch as jest.Mock;

	function renderComponent(props?: Partial<BuildActionsProps>) {
		return render(<BuildActions story={fakeStory()} {...props} />);
	}

	describe('when not given a story prop', () => {
		beforeEach(() => {
			usePublishingMock.mockReturnValue({});
			useStoryLaunchMock.mockReturnValue({});
			renderComponent({story: undefined});
		});

		it('disables the test button', () =>
			expect(screen.getByText('routeActions.build.test')).toBeDisabled());

		it('disables the play button', () =>
			expect(screen.getByText('routeActions.build.play')).toBeDisabled());

		it('disables the proof button', () =>
			expect(screen.getByText('routeActions.build.proof')).toBeDisabled());

		it('disables the publish to story button', () =>
			expect(
				screen.getByText('routeActions.build.publishToFile')
			).toBeDisabled());
	});

	describe('when given a story prop', () => {
		let playStory: jest.SpyInstance;
		let proofStory: jest.SpyInstance;
		let publishStory: jest.SpyInstance;
		let testStory: jest.SpyInstance;
		let story: Story;

		beforeEach(() => {
			playStory = jest.fn();
			proofStory = jest.fn();
			publishStory = jest.fn();
			testStory = jest.fn();
			usePublishingMock.mockReturnValue({publishStory});
			useStoryLaunchMock.mockReturnValue({playStory, proofStory, testStory});
			story = fakeStory();
			renderComponent({story});
		});

		it('displays a button to test the story', () => {
			expect(testStory).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.test'));
			expect(testStory.mock.calls).toEqual([[story.id]]);
		});

		it('displays the error if testing fails', async () => {
			testStory.mockRejectedValue(new Error('mock-test-error'));
			fireEvent.click(screen.getByText('routeActions.build.test'));
			await waitFor(() =>
				expect(screen.getByText('mock-test-error')).toBeInTheDocument()
			);
		});

		it('displays a button to play the story', () => {
			expect(playStory).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.play'));
			expect(playStory.mock.calls).toEqual([[story.id]]);
		});

		it('displays the error if playing fails', async () => {
			playStory.mockRejectedValue(new Error('mock-play-error'));
			fireEvent.click(screen.getByText('routeActions.build.play'));
			await waitFor(() =>
				expect(screen.getByText('mock-play-error')).toBeInTheDocument()
			);
		});

		it('displays a button to proof the story', () => {
			expect(proofStory).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.proof'));
			expect(proofStory.mock.calls).toEqual([[story.id]]);
		});

		it('displays the error if proofing fails', async () => {
			proofStory.mockRejectedValue(new Error('mock-proof-error'));
			fireEvent.click(screen.getByText('routeActions.build.proof'));
			await waitFor(() =>
				expect(screen.getByText('mock-proof-error')).toBeInTheDocument()
			);
		});

		it('displays a button to publish the story to a file', () => {
			expect(publishStory).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.publishToFile'));
			expect(publishStory.mock.calls).toEqual([[story.id]]);
		});

		it('displays the error if publishing fails', async () => {
			publishStory.mockRejectedValue(new Error('mock-publish-error'));
			fireEvent.click(screen.getByText('routeActions.build.publishToFile'));
			await waitFor(() =>
				expect(screen.getByText('mock-publish-error')).toBeInTheDocument()
			);
		});
	});

	it('is accessible', async () => {
		usePublishingMock.mockReturnValue({});
		useStoryLaunchMock.mockReturnValue({});

		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
