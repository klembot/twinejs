import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import {Story} from '../../../store/stories';
import {FakeStateProvider, fakeStory, StoryInspector} from '../../../test-util';
import {StoryImportDialog, StoryImportDialogProps} from '../story-import';

jest.mock('../file-chooser');
jest.mock('../story-chooser');

describe('StoryImportDialog', () => {
	function renderComponent(
		props?: Partial<StoryImportDialogProps>,
		stories?: Story[]
	) {
		const story = fakeStory();

		// Should match the story name in FileChooser's mock.
		story.name = 'mock-story';

		return render(
			<FakeStateProvider stories={stories ?? [story]}>
				<StoryImportDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					{...props}
				/>
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	describe('initially', () => {
		it('shows a file chooser', () => {
			renderComponent();
			expect(screen.getByTestId('mock-file-chooser')).toBeInTheDocument();
		});
	});

	describe('when a file is selected that contains stories that conflict with existing ones', () => {
		beforeEach(() => {
			renderComponent();
			fireEvent.click(screen.getByText('onChange'));
		});

		it('displays a story chooser with the stories in the file', () => {
			const storyChooser = screen.getByTestId('mock-story-chooser');

			expect(storyChooser).toBeInTheDocument();
			expect(within(storyChooser).getByRole('listitem')).toHaveTextContent(
				'mock-story'
			);
		});

		it('still displays the file chooser', () =>
			expect(screen.getByTestId('mock-file-chooser')).toBeInTheDocument());

		it("doesn't show a warning message if the file contained stories", () =>
			expect(
				screen.queryByText('dialogs.storyImport.noStoriesInFile')
			).not.toBeInTheDocument());
	});

	describe('when a file is selected that contains stories without conflicts', () => {
		let onClose: jest.Mock;

		beforeEach(() => {
			onClose = jest.fn();
			renderComponent({onClose}, []);
			fireEvent.click(screen.getByText('onChange'));
		});

		it('immediately imports the stories', () =>
			expect(screen.getByTestId('story-inspector-default')).toHaveAttribute(
				'data-name',
				'mock-story'
			));

		it('closes', () => expect(onClose).toBeCalled());
	});

	describe('when a file is selected that has no stories', () => {
		beforeEach(() => {
			renderComponent();
			fireEvent.click(screen.getByText('onChange no story'));
		});

		it('shows a message', () =>
			expect(
				screen.getByText('dialogs.storyImport.noStoriesInFile')
			).toBeInTheDocument());

		it('still displays the file chooser', () =>
			expect(screen.getByTestId('mock-file-chooser')).toBeInTheDocument());
	});

	describe('when stories are selected', () => {
		let onClose: jest.Mock;

		beforeEach(() => {
			onClose = jest.fn();
			renderComponent({onClose});
			fireEvent.click(screen.getByText('onChange'));
			fireEvent.click(screen.getByText('onImport'));
		});

		it('imports the selected stories into state', () =>
			expect(screen.getByTestId('story-inspector-default')).toHaveAttribute(
				'data-name',
				'mock-story'
			));

		it('closes', () => expect(onClose).toBeCalled());
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
