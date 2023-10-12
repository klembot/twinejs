import {storyFileName} from '../story-filename';
import {fakeStory} from '../../../test-util';
import {Story} from '../../../store/stories/stories.types';

describe('storyFileName', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('adds a .html file suffix by default', () =>
		expect(storyFileName(story)).toBe(`${story.name}.html`));

	it('uses the file suffix specified', () =>
		expect(storyFileName(story, '.txt')).toBe(`${story.name}.txt`));

	it('maintains the case of the story', () => {
		expect(storyFileName({...story, name: story.name.toUpperCase()})).toBe(
			`${story.name.toUpperCase()}.html`
		);
		expect(storyFileName({...story, name: story.name.toLowerCase()})).toBe(
			`${story.name.toLowerCase()}.html`
		);
	});

	it('replaces non-POSIX friendly characters with underscores', () => {
		expect(storyFileName({...story, name: 'problematic:name'})).toBe(
			'problematic_name.html'
		);
	});
});
