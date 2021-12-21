import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeStory} from '../../../test-util';
import {lorem} from 'faker';
import {
	StoryDetailsDialogStats,
	StoryDetailsDialogStatsProps
} from '../story-stats';

describe('<StoryDetailsDialogStats>', () => {
	function renderComponent(props?: StoryDetailsDialogStatsProps) {
		return render(<StoryDetailsDialogStats story={fakeStory()} {...props} />);
	}

	it('shows a character count for the story', () => {
		const story = fakeStory(2);
		const text = lorem.words(50);
		const text2 = lorem.words(50);

		story.passages[0].text = text;
		story.passages[1].text = text2;
		renderComponent({story});

		const row = screen.getByText('dialogs.storyDetails.stats.characters')
			.parentNode;

		expect(row!.querySelectorAll('td')[0].textContent).toBe(
			(text.length + text2.length).toString()
		);
	});

	it('shows a word count for the story', () => {
		const story = fakeStory(2);
		const text = lorem.words(10);
		const text2 = lorem.words(25);

		story.passages[0].text = text;
		story.passages[1].text = text2;
		renderComponent({story});

		const row = screen.getByText('dialogs.storyDetails.stats.words').parentNode;

		expect(row!.querySelectorAll('td')[0].textContent).toBe('35');
	});

	it('shows a passage count for the story', () => {
		const passageCount = Math.round(Math.random() * 100);
		const story = fakeStory(passageCount);

		renderComponent({story});

		const row = screen.getByText('dialogs.storyDetails.stats.passages')
			.parentNode;

		expect(row!.querySelectorAll('td')[0].textContent).toBe(
			passageCount.toString()
		);
	});

	it('shows a distinct link count for the story', () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[0].text = '[[b]] [[b]]';
		story.passages[1].name = 'b';
		story.passages[1].text = '[[a]] [[a]] [[a]]';
		renderComponent({story});

		const row = screen.getByText('dialogs.storyDetails.stats.links').parentNode;

		expect(row!.querySelectorAll('td')[0].textContent).toBe('2');
	});

	it('shows a broken link count for the story', () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[0].text = '[[b]]';
		story.passages[1].name = 'b';
		story.passages[1].text = '[[a]] [[c]]';
		renderComponent({story});

		const row = screen.getByText('dialogs.storyDetails.stats.brokenLinks')
			.parentNode;

		expect(row!.querySelectorAll('td')[0].textContent).toBe('1');
	});

	it('shows the time the story was last updated', () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.storyDetails.stats.lastUpdate')
		).toBeInTheDocument();
	});

	it("shows the story's IFID", () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.storyDetails.stats.ifid')
		).toBeInTheDocument();
	});

	it('shows a link that explains what an IFID is', () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.storyDetails.stats.ifidExplanation')
		).toHaveAttribute('href', 'https://ifdb.org/help-ifid');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
