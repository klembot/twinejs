import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../test-util';
import {StorySearchDialog, StorySearchDialogProps} from '../story-search';

jest.mock('../../components/control/code-area/code-area');

const TestStorySearchDialog = (props: Partial<StorySearchDialogProps>) => {
	const [open, setOpen] = React.useState(true);
	const {stories} = useStoriesContext();

	return (
		<>
			<button onClick={() => setOpen(false)}>close</button>
			{open && (
				<StorySearchDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onChangeProps={jest.fn()}
					onClose={jest.fn()}
					storyId={stories[0].id}
					find={''}
					flags={{}}
					replace={''}
					{...props}
				/>
			)}
		</>
	);
};

describe('<StorySearchDialog>', () => {
	function renderComponent(
		props?: Partial<StorySearchDialogProps>,
		context?: Partial<FakeStateProviderProps>
	) {
		return render(
			<FakeStateProvider {...context}>
				<StoryInspector />
				<TestStorySearchDialog {...props} />
			</FakeStateProvider>
		);
	}

	// Needed because the dialog dispatches actions on unmount.
	afterEach(async () => await act(() => Promise.resolve()));

	describe.each([
		['Find', 'dialogs.storySearch.find', 'find'],
		['Replace', 'dialogs.storySearch.replaceWith', 'replace']
	])('%s field', (name, label, propName) => {
		it(`sets its value with the ${propName} prop`, () => {
			renderComponent({[propName]: 'test-value'});
			expect(screen.getByRole('textbox', {name: label})).toHaveValue(
				'test-value'
			);
		});

		it('updates props on itself when the field is changed', () => {
			const onChangeProps = jest.fn();
			const story = fakeStory();
			const existing = {
				find: 'existing-find',
				flags: {includePassageNames: true},
				replace: 'existing-replace',
				storyId: story.id
			};

			renderComponent({onChangeProps, ...existing}, {stories: [story]});
			fireEvent.change(screen.getByRole('textbox', {name: label}), {
				target: {value: 'test-change'}
			});
			expect(onChangeProps.mock.calls).toEqual([
				[{...existing, [propName]: 'test-change'}]
			]);
		});
	});

	describe.each([
		['Include Passage Names', 'includePassageNames'],
		['Match Case', 'matchCase'],
		['Use Regexes', 'useRegexes']
	])('%s field', (name, label) => {
		it(`is checked if the ${label} prop is true`, () => {
			renderComponent({flags: {[label]: true}});
			expect(
				screen.getByRole('checkbox', {name: `dialogs.storySearch.${label}`})
			).toBeChecked();
		});

		it(`is unchecked if the ${label} prop is false`, () => {
			renderComponent({flags: {[label]: false}});
			expect(
				screen.getByRole('checkbox', {name: `dialogs.storySearch.${label}`})
			).not.toBeChecked();
		});

		it('updates props on itself when checked', () => {
			const onChangeProps = jest.fn();
			const story = fakeStory();
			const existing = {
				find: 'existing-find',
				flags: {
					includePassageNames: true,
					matchCase: true,
					useRegexes: true,
					[label]: false
				},
				replace: 'existing-replace',
				storyId: story.id
			};

			renderComponent({onChangeProps, ...existing}, {stories: [story]});
			fireEvent.click(
				screen.getByRole('checkbox', {name: `dialogs.storySearch.${label}`})
			);
			expect(onChangeProps.mock.calls).toEqual([
				[{...existing, flags: {...existing.flags, [label]: true}}]
			]);
		});

		it('updates props on itself when unchecked', () => {
			const onChangeProps = jest.fn();
			const story = fakeStory();
			const existing = {
				find: 'existing-find',
				flags: {
					includePassageNames: true,
					matchCase: true,
					useRegexes: true
				},
				replace: 'existing-replace',
				storyId: story.id
			};

			renderComponent({onChangeProps, ...existing}, {stories: [story]});
			fireEvent.click(
				screen.getByRole('checkbox', {name: `dialogs.storySearch.${label}`})
			);
			expect(onChangeProps.mock.calls).toEqual([
				[{...existing, flags: {...existing.flags, [label]: false}}]
			]);
		});
	});

	it('removes highlighting from all passages when mounted', async () => {
		const story = fakeStory(3);

		story.passages[0].highlighted = true;
		story.passages[1].highlighted = true;
		story.passages[2].highlighted = true;
		renderComponent({}, {stories: [story]});
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.highlighted
		).toBe('false');
		expect(
			screen.getByTestId(`passage-${story.passages[2].id}`).dataset.highlighted
		).toBe('false');
	});

	it('highlights matching passages based on the find prop', async () => {
		const story = fakeStory(3);

		story.passages[0].highlighted = false;
		story.passages[0].text = 'aaa';
		story.passages[1].highlighted = true;
		story.passages[1].text = 'bbb';
		story.passages[2].highlighted = false;
		story.passages[2].text = 'ccc';
		renderComponent({find: 'aaa'}, {stories: [story]});
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('true')
		);
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.highlighted
		).toBe('false');
		expect(
			screen.getByTestId(`passage-${story.passages[2].id}`).dataset.highlighted
		).toBe('false');
	});

	it('debounces highlighting matches', async () => {
		const story = fakeStory(1);

		story.passages[0].highlighted = false;
		story.passages[0].text = 'aaa';
		renderComponent({find: 'a'}, {stories: [story]});
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.highlighted
		).toBe('false');
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('true')
		);
	});

	it('incorporates the flags prop when highlighting matches', async () => {
		const story = fakeStory();

		story.passages[0].highlighted = true;
		story.passages[0].name = 'aBC';
		story.passages[0].text = '';
		renderComponent(
			{
				find: 'aB.',
				flags: {includePassageNames: false, matchCase: true, useRegexes: true}
			},
			{stories: [story]}
		);
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
	});

	it('removes all highlighting when closed', async () => {
		const story = fakeStory();

		story.passages[0].highlighted = true;
		renderComponent({}, {stories: [story]});
		fireEvent.click(screen.getByText('close'));

		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
	});

	it('shows the number of matching passages for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({find: 'a'}, {stories: [story]});
		expect(
			screen.getByText('dialogs.storySearch.matchCount')
		).toBeInTheDocument();
		expect(
			screen.queryByText('dialogs.storySearch.noMatches')
		).not.toBeInTheDocument();
	});

	it('shows a message if no passages match the search', async () => {
		const story = fakeStory(1);

		story.passages[0].name = 'aaa';
		story.passages[0].text = 'bbb';
		renderComponent({find: 'e'}, {stories: [story]});
		expect(
			await screen.findByText('dialogs.storySearch.noMatches')
		).toBeInTheDocument();
		expect(
			screen.queryByText('dialogs.storySearch.matchCount')
		).not.toBeInTheDocument();
	});

	it('replaces text in passages when the replace button is clicked', async () => {
		const story = fakeStory(1);

		story.passages[0].text = 'mock-find';
		renderComponent(
			{
				find: 'mock-find',
				flags: {includePassageNames: false, matchCase: true, useRegexes: true},
				replace: 'mock-replace'
			},
			{stories: [story]}
		);

		const replaceButton = screen.getByText('dialogs.storySearch.replaceAll');

		expect(replaceButton).not.toBeDisabled();
		fireEvent.click(replaceButton);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`)
		).toHaveTextContent('mock-replace');
	});

	it('disables the replace button if there are no matches for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent(
			{find: 'mock-find', replace: 'mock-replace'},
			{stories: [story]}
		);
		expect(screen.getByText('dialogs.storySearch.replaceAll')).toBeDisabled();
	});

	it('disables the replace button if the search is empty', () => {
		renderComponent({find: '', replace: 'mock-replace'});
		expect(screen.getByText('dialogs.storySearch.replaceAll')).toBeDisabled();
	});

	it('uses CodeMirror on its code areas when CodeMirror is enabled', () => {
		renderComponent({}, {prefs: {useCodeMirror: true}});

		for (const area of screen.getAllByTestId('mock-code-area')) {
			expect(area.dataset.useCodeMirror).toBe('true');
		}
	});

	it('disables CodeMirror on its code areas when CodeMirror is disabled', () => {
		renderComponent({}, {prefs: {useCodeMirror: false}});

		for (const area of screen.getAllByTestId('mock-code-area')) {
			expect(area.dataset.useCodeMirror).toBe('false');
		}
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
