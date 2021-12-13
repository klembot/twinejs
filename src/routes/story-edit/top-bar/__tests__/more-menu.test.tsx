import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../store/stories';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../test-util';
import {MoreMenu} from '../more-menu';

jest.mock('../../../../components/control/menu-button');

const TestMoreMenu: React.FC = () => {
	const {stories} = useStoriesContext();

	return <MoreMenu story={stories[0]} />;
};

describe('<MoreMenu> (of story edit route)', () => {
	function renderComponent(context?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...context}>
				<TestMoreMenu />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it.each([
		[
			'story search',
			'routes.storyEdit.topBar.findAndReplace',
			'dialogs.storySearch.title'
		],
		[
			'passage tags',
			'routes.storyEdit.topBar.passageTags',
			'dialogs.passageTags.title'
		],
		[
			'story JavaScript',
			'routes.storyEdit.topBar.editJavaScript',
			'dialogs.storyJavaScript.title'
		],
		[
			'story stylesheet',
			'routes.storyEdit.topBar.editStylesheet',
			'dialogs.storyStylesheet.title'
		],
		['app preferences', 'common.preferences', 'dialogs.appPrefs.title']
	])(
		'displays a button to open the %s dialog',
		(_, buttonLabel, dialogTitle) => {
			renderComponent();
			expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument();
			fireEvent.click(screen.getByText(buttonLabel));
			expect(screen.getByText(dialogTitle)).toBeInTheDocument();
		}
	);

	it('displays a button to open the story stats dialog', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat();

		story.storyFormat = format.name;
		story.storyFormatVersion = format.version;
		renderComponent({stories: [story], storyFormats: [format]});
		fireEvent.click(screen.getByText('routes.storyEdit.topBar.storyInfo'));
		expect(screen.getByText(story.name)).toBeInTheDocument();

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
	});

	it('displays a button to select all passages', () => {
		const story = fakeStory(5);

		for (const passage of story.passages) {
			passage.selected = false;
		}

		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByText('routes.storyEdit.topBar.selectAllPassages')
		);

		const passages = screen
			.getByTestId('story-inspector-default')
			.querySelectorAll('[data-testid^=passage]');

		for (const passage of Array.from(passages)) {
			expect((passage as HTMLElement).dataset.selected).toBe('true');
		}
	});

	it.todo('displays a button to publish the story');

	it('displays a button to proof the story', () => {
		const openSpy = jest.spyOn(window, 'open');
		const story = fakeStory();

		openSpy.mockReturnValue(null);
		renderComponent({stories: [story]});
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('routes.storyEdit.topBar.proofStory'));
		expect(openSpy.mock.calls).toEqual([
			[`#/stories/${story.id}/proof`, '_blank']
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
