import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {
	InlinePassageTitle,
	InlinePassageTitleProps
} from '../inline-passage-title';
import {useStoriesContext} from '../../../store/stories';

const TestInlinePassageTitle: React.FC<
	Partial<InlinePassageTitleProps> & {storyPassageCount?: number}
> = ({storyPassageCount, ...overrides}) => {
	const {stories} = useStoriesContext();
	const story = stories[0];
	const passage = story.passages[0];

	return (
		<InlinePassageTitle
			passage={passage}
			story={story}
			{...overrides}
		/>
	);
};

function renderComponent(
	props?: Partial<InlinePassageTitleProps>,
	context?: FakeStateProviderProps
) {
	return render(
		<FakeStateProvider {...context}>
			<TestInlinePassageTitle {...props} />
			<StoryInspector />
		</FakeStateProvider>
	);
}

describe('<InlinePassageTitle>', () => {
	describe('when not editing', () => {
		it('displays the passage name', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			expect(screen.getByText(story.passages[0].name.trim())).toBeInTheDocument();
		});

		it('shows a rename tooltip when not disabled', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			expect(
				document.querySelector('[title="common.rename"]')
			).toBeInTheDocument();
		});

		it('does not show a rename tooltip when disabled', () => {
			const story = fakeStory(1);

			renderComponent({disabled: true}, {stories: [story]});
			expect(
				document.querySelector('[title="common.rename"]')
			).not.toBeInTheDocument();
		});

		it('enters edit mode on double-click', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			fireEvent.doubleClick(
				screen.getByText(story.passages[0].name.trim())
			);
			expect(
				screen.getByRole('textbox', {name: 'common.rename'})
			).toBeInTheDocument();
		});

		it('does not enter edit mode on double-click when disabled', () => {
			const story = fakeStory(1);

			renderComponent({disabled: true}, {stories: [story]});
			fireEvent.doubleClick(
				screen.getByText(story.passages[0].name.trim())
			);
			expect(
				screen.queryByRole('textbox', {name: 'common.rename'})
			).not.toBeInTheDocument();
		});
	});

	describe('when editing', () => {
		function enterEditMode(story: ReturnType<typeof fakeStory>) {
			fireEvent.doubleClick(
				screen.getByText(story.passages[0].name.trim())
			);
		}

		it('pre-fills the input with the current passage name', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			expect(
				screen.getByRole('textbox', {name: 'common.rename'})
			).toHaveValue(story.passages[0].name);
		});

		it('renames the passage on Enter', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: 'new-name'}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.name
			).toBe('new-name');
		});

		it('does not rename if the value is unchanged on Enter', () => {
			const story = fakeStory(1);
			const originalName = story.passages[0].name;

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			// Should exit edit mode without dispatching
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.name
			).toBe(originalName);
		});

		it('cancels editing on Escape', () => {
			const story = fakeStory(1);
			const originalName = story.passages[0].name;

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: 'changed-name'}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Escape'}
			);
			// Should exit edit mode without renaming
			expect(
				screen.queryByRole('textbox', {name: 'common.rename'})
			).not.toBeInTheDocument();
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.name
			).toBe(originalName);
		});

		it('submits on blur', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: 'blur-name'}}
			);
			fireEvent.blur(
				screen.getByRole('textbox', {name: 'common.rename'})
			);
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.name
			).toBe('blur-name');
		});

		it('shows a tooltip error for empty names', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: ''}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			expect(screen.getByRole('alert')).toHaveTextContent(
				'components.renamePassageButton.emptyName'
			);
		});

		it('shows a tooltip error for duplicate names', () => {
			const story = fakeStory(2);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: story.passages[1].name}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			expect(screen.getByRole('alert')).toHaveTextContent(
				'components.renamePassageButton.nameAlreadyUsed'
			);
		});

		it('clears the error when the user types', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: ''}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			expect(screen.getByRole('alert')).toBeInTheDocument();
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: 'a'}}
			);
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		});

		it('stays in edit mode when validation fails', () => {
			const story = fakeStory(1);

			renderComponent({}, {stories: [story]});
			enterEditMode(story);
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{target: {value: ''}}
			);
			fireEvent.keyDown(
				screen.getByRole('textbox', {name: 'common.rename'}),
				{key: 'Enter'}
			);
			// Should still be in edit mode
			expect(
				screen.getByRole('textbox', {name: 'common.rename'})
			).toBeInTheDocument();
		});
	});

	it('is accessible when not editing', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});

	it('is accessible when editing', async () => {
		const story = fakeStory(1);

		const {container} = renderComponent({}, {stories: [story]});

		fireEvent.doubleClick(
			screen.getByText(story.passages[0].name.trim())
		);
		await act(() => Promise.resolve());
		expect(await axe(container)).toHaveNoViolations();
	});
});
