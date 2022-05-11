import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {PassageToolbar} from '../passage-toolbar';

jest.mock('../../../components/control/menu-button');
jest.mock('../../../components/passage/rename-passage-button');
jest.mock('../../../components/tag/add-tag-button');

const TestPassageToolbar: React.FC = () => {
	const {stories} = useStoriesContext();

	return <PassageToolbar passage={stories[0].passages[0]} story={stories[0]} />;
};

describe('<PassageToolbar>', () => {
	async function renderComponent(context?: FakeStateProviderProps) {
		const result = render(
			<FakeStateProvider {...context}>
				<TestPassageToolbar />
				<StoryInspector />
			</FakeStateProvider>
		);

		// Needed because of <PromptButton>
		await act(() => Promise.resolve());
		return result;
	}

	it('adds a tag to the passage if the user adds one', async () => {
		const story = fakeStory(1);

		story.passages[0].tags = [];
		await renderComponent({stories: [story]});
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.tags
		).toBe('');
		fireEvent.click(
			within(screen.getByTestId('mock-add-tag-button')).getByText('onAdd')
		);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.tags
		).toBe('mock-tag-name');
	});

	it('renames the passage if the user uses the rename button', async () => {
		const story = fakeStory(1);

		await renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByText(`mock-rename-passage-button-${story.passages[0].id}`)
		);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.name
		).toBe('mock-new-passage-name');
	});

	it('displays a checkbox button showing whether the passage is the start passage', async () => {
		const story = fakeStory(2);

		await renderComponent({stories: [story]});

		let startCheckbox = screen.getByRole('checkbox', {
			name: 'dialogs.passageEdit.setAsStart'
		});

		expect(startCheckbox).toBeChecked();
		// See https://github.com/testing-library/jest-dom/issues/144
		expect(startCheckbox).toHaveAttribute('aria-disabled', 'true');
		cleanup();
		story.startPassage = story.passages[1].id;
		await renderComponent({stories: [story]});
		startCheckbox = screen.getByRole('checkbox', {
			name: 'dialogs.passageEdit.setAsStart'
		});
		expect(startCheckbox).not.toBeChecked();
		expect(startCheckbox).not.toHaveAttribute('aria-disabled', 'true');
	});

	it('sets the passage as the start one if the user uses the checkbox button', async () => {
		const story = fakeStory(2);

		story.startPassage = story.passages[1].id;
		await renderComponent({stories: [story]});
		expect(
			screen.getByTestId('story-inspector-default').dataset.startPassage
		).toBe(story.passages[1].id);
		fireEvent.click(screen.getByText('dialogs.passageEdit.setAsStart'));
		expect(
			screen.getByTestId('story-inspector-default').dataset.startPassage
		).toBe(story.passages[0].id);
	});

	// Need a higher-fidelity mock of <MenuButton> that includes checked state.

	it.todo(
		"displays a dropdown menu of sizes, with the passage's current one selected"
	);

	it.each([
		['small', 'Small', {height: 100, width: 100}],
		['large', 'Large', {height: 200, width: 200}],
		['tall', 'Tall', {height: 200, width: 100}],
		['wide', 'Wide', {height: 100, width: 200}]
	])(
		'updates the passage when its size is changed to %s',
		async (_, label, passageProps) => {
			const story = fakeStory(2);

			story.passages[0].width = 10;
			story.passages[0].height = 10;
			await renderComponent({stories: [story]});
			fireEvent.click(screen.getByText(`dialogs.passageEdit.size${label}`));

			const passage = screen.getByTestId(`passage-${story.passages[0].id}`);

			expect(passage.dataset.height).toBe(passageProps.height.toString());
			expect(passage.dataset.width).toBe(passageProps.width.toString());
		}
	);

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
