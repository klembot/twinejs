import {storyFileName} from '../story-filename';
import {fakeStory} from '../../../test-util';
import {Story} from '../../../store/stories';

describe('storyFileName', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('adds a .html file suffix', () =>
		expect(storyFileName(story)).toBe(`${story.name}.html`));

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
