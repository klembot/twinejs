import {createUntitledPassage} from '../create-untitled-passage';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';
import {passageDefaults} from '../../defaults';

describe('createUntitledPassage', () => {
	const defs = passageDefaults();
	let story: Story;

	beforeEach(() => {
		story = fakeStory(2);
		story.passages[0].name = 'mock-passage-1';
		story.passages[1].name = 'mock-passage-2';
	});

	it('creates a passage with the default name centered at the position given', () => {
		expect(createUntitledPassage(story, 100, 100)).toEqual({
			type: 'createPassage',
			props: {
				height: defs.height,
				left: 100 - defs.width / 2,
				name: defs.name,
				story: story.id,
				top: 100 - defs.height / 2,
				width: defs.width
			},
			storyId: story.id
		});
	});

	it('adds a number at the end of the passage name until a unique one is reached', () => {
		story.passages[0].name = defs.name;

		expect(createUntitledPassage(story, 100, 100)).toEqual({
			type: 'createPassage',
			props: expect.objectContaining({
				name: `${defs.name} 1`
			}),
			storyId: story.id
		});

		story.passages[1].name = `${defs.name} 1`;
		expect(createUntitledPassage(story, 100, 100)).toEqual({
			type: 'createPassage',
			props: expect.objectContaining({
				name: `${defs.name} 2`
			}),
			storyId: story.id
		});
	});

	it('forces a passage onscreen', () => {
		expect(createUntitledPassage(story, -10000, -10000)).toEqual({
			type: 'createPassage',
			props: expect.objectContaining({
				left: 0,
				top: 0
			}),
			storyId: story.id
		});
	});

	it('moves the passage so it does not overlap existing ones', () => {
		const action = createUntitledPassage(
			story,
			story.passages[0].left,
			story.passages[1].top
		);

		expect(action).toEqual(
			expect.objectContaining({
				type: 'createPassage',
				props: expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number)
				}),
				storyId: story.id
			})
		);
		expect(
			action.props.left === story.passages[0].left &&
				action.props.top === story.passages[0].top
		).toBe(false);
	});

	it.todo('snaps the passage to the grid is the story has grid snapping on');

	it('throws an error if either position is NaN', () => {
		expect(() => createUntitledPassage(story, NaN, 0)).toThrow();
		expect(() => createUntitledPassage(story, 0, NaN)).toThrow();
		expect(() => createUntitledPassage(story, Infinity, 0)).toThrow();
		expect(() => createUntitledPassage(story, 0, Infinity)).toThrow();
	});
});
