import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../test-util';
import {DialogsContext, DialogsContextProps} from '../../context';
import {PassageEditStack, PassageEditStackProps} from '../passage-edit-stack';

jest.mock('../passage-edit-contents');
jest.mock('../../../components/tag/tag-grid');
jest.mock('../../../components/visible-whitespace/visible-whitespace');

const TestPassageEditStack: React.FC<
	Partial<PassageEditStackProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<div data-testid="passage-edit-stack">
			<PassageEditStack
				collapsed={false}
				onChangeCollapsed={jest.fn()}
				onChangeHighlighted={jest.fn()}
				onChangeMaximized={jest.fn()}
				onChangeProps={jest.fn()}
				onClose={jest.fn()}
				passageIds={stories[0].passages.map(({id}) => id)}
				storyId={stories[0].id}
				{...props}
			/>
		</div>
	);
};

describe('<PassageEditStack>', () => {
	function renderComponent(
		stateContext?: FakeStateProviderProps,
		dialogContext?: Partial<DialogsContextProps>,
		props?: Partial<PassageEditStackProps>
	) {
		const onChangeProps = jest.fn();
		const onClose = jest.fn();

		return {
			onChangeProps,
			onClose,
			...render(
				<FakeStateProvider {...stateContext}>
					<DialogsContext.Provider
						value={{
							dialogs: [],
							dispatch: jest.fn(),
							...dialogContext
						}}
					>
						<TestPassageEditStack
							{...props}
							onChangeProps={onChangeProps}
							onClose={onClose}
						/>
					</DialogsContext.Provider>
				</FakeStateProvider>
			)
		};
	}

	it('displays a dialog card for every passage', () => {
		const story = fakeStory(2);

		renderComponent({stories: [story]});
		expect(
			screen.getByTestId(
				`mock-passage-edit-contents-${story.id}-${story.passages[0].id}`
			)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(
				`mock-passage-edit-contents-${story.id}-${story.passages[1].id}`
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', {name: story.passages[0].name})
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', {name: story.passages[1].name})
		).toBeInTheDocument();
	});

	it('displays a tag grid for each passage', () => {
		const story = fakeStory(2);

		story.passages[0].tags = ['tag-1'];
		story.passages[1].tags = ['tag-2', 'tag-3'];

		renderComponent({stories: [story]});

		const tagGrids = screen.getAllByTestId('mock-tag-grid');

		expect(tagGrids).toHaveLength(2);

		// Order is reversed here because of rendering order.

		expect(tagGrids[0]).toHaveTextContent('tag-2 tag-3');
		expect(tagGrids[1]).toHaveTextContent('tag-1');
	});

	it('makes whitespace visible in passage names in the dialog cards', () => {
		const story = fakeStory(2);

		renderComponent({stories: [story]});

		const whitespace = screen.getAllByTestId('mock-visible-whitespace');

		expect(whitespace).toHaveLength(2);

		// Order is reversed here because of rendering order.

		expect(whitespace[0]).toHaveTextContent(story.passages[1].name);
		expect(whitespace[1]).toHaveTextContent(story.passages[0].name);
	});

	it('calls onChangeProps if any passages do not exist', () => {
		const story = fakeStory(1);

		const {onChangeProps} = renderComponent({stories: [story]}, undefined, {
			passageIds: [story.passages[0].id, 'nonexistent']
		});

		expect(onChangeProps.mock.calls).toEqual([
			[expect.objectContaining({passageIds: [story.passages[0].id]})]
		]);
	});

	it('renders nothing and calls onClose if all passages do not exist', () => {
		const story = fakeStory();

		const {onClose} = renderComponent({stories: [story]}, undefined, {
			passageIds: ['nonexistent1', 'nonexistent2']
		});

		expect(onClose).toBeCalledTimes(1);
	});

	describe('When a passage editor is closed', () => {
		// Would be cleaner to use a real dialog context in these...

		it('calls onChangeProps if there are still passages left', () => {
			const story = fakeStory(2);
			const dialogs = [
				{
					collapsed: false,
					component: PassageEditStack,
					highlighted: false,
					maximized: false,
					props: {
						passageIds: [story.passages[0].id, story.passages[1].id],
						storyId: story.id
					}
				}
			];
			const dispatch = jest.fn();
			const innerDispatch = jest.fn();

			renderComponent({stories: [story]}, {dialogs, dispatch});
			expect(dispatch).not.toBeCalled();
			fireEvent.click(screen.getAllByLabelText('common.close')[0]);
			dispatch.mock.calls[0][0](innerDispatch, () => dialogs);
			expect(innerDispatch.mock.calls).toEqual([
				[
					{
						index: 0,
						props: {passageIds: [story.passages[0].id], storyId: story.id},
						type: 'setDialogProps'
					}
				]
			]);
		});

		it('calls onClose if the shift key is held when closing a passage editor', () => {
			const story = fakeStory(2);
			const {onClose} = renderComponent({stories: [story]});

			expect(onClose).not.toBeCalled();
			fireEvent.click(screen.getAllByLabelText('common.close')[0], {
				shiftKey: true
			});
			expect(onClose).toBeCalledTimes(1);
		});

		it('dispatches an action to close the stack if that was the last passage editor', () => {
			const story = fakeStory(1);
			const dialogs = [
				{
					collapsed: false,
					component: PassageEditStack,
					highlighted: false,
					maximized: false,
					props: {passageIds: [story.passages[0].id], storyId: story.id}
				}
			];
			const dispatch = jest.fn();
			const innerDispatch = jest.fn();

			renderComponent({stories: [story]}, {dialogs, dispatch});
			expect(dispatch).not.toBeCalled();
			fireEvent.click(screen.getByLabelText('common.close'));
			dispatch.mock.calls[0][0](innerDispatch, () => dialogs);
			expect(innerDispatch.mock.calls).toEqual([
				[{index: 0, type: 'removeDialog'}]
			]);
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
