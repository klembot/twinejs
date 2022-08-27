import {importStories} from '../import-stories';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('importStories action creator', () => {
	let dispatch: jest.Mock;
	let state: Story[];
	let toImport: Story[];

	beforeEach(() => {
		dispatch = jest.fn();
		state = [fakeStory(), fakeStory()];
		toImport = [fakeStory(), fakeStory()];
	});

	describe('when there is not an existing story with the same name in state', () => {
		beforeEach(() => {
			toImport[0].name = state[0].name + '-no-conflict';
			toImport[1].name = state[1].name + '-no-conflict';
		});

		it('returns a thunk that dispatches a createStory action for each story', () => {
			delete (toImport[0] as any).id;
			delete (toImport[1] as any).id;
			importStories(toImport, state)(dispatch, () => state);
			expect(dispatch.mock.calls).toEqual([
				[{type: 'createStory', props: toImport[0]}],
				[{type: 'createStory', props: toImport[1]}]
			]);
		});

		it('strips any ID property off the story to import', () => {
			importStories(toImport, state)(dispatch, () => state);
			expect(dispatch.mock.calls[0][0].props.id).not.toBeDefined();
			expect(dispatch.mock.calls[1][0].props.id).not.toBeDefined();
		});
	});

	describe('when there is an existing story with the same name in state', () => {
		beforeEach(() => {
			toImport[0].name = state[0].name;
			toImport[1].name = state[1].name;
		});

		it('returns a thunk that dispatches a updateStory action for each story', () => {
			delete (toImport[0] as any).id;
			delete (toImport[1] as any).id;
			importStories(toImport, state)(dispatch, () => state);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'updateStory',
						storyId: state[0].id,
						props: {
							...toImport[0],
							passages: toImport[0].passages.map(passage => ({
								...passage,
								story: state[0].id
							}))
						}
					}
				],
				[
					{
						type: 'updateStory',
						storyId: state[1].id,
						props: {
							...toImport[1],
							passages: toImport[1].passages.map(passage => ({
								...passage,
								story: state[1].id
							}))
						}
					}
				]
			]);
		});

		it('strips any ID property off the story to import', () => {
			importStories(toImport, state)(dispatch, () => state);
			expect(dispatch.mock.calls[0][0].props.id).not.toBeDefined();
			expect(dispatch.mock.calls[1][0].props.id).not.toBeDefined();
		});

		it('links passages to the existing story', () => {
			importStories(toImport, state)(dispatch, () => state);
			expect(
				dispatch.mock.calls[0][0].props.passages.every(
					(passage: Passage) => passage.story === state[0].id
				)
			).toBe(true);
			expect(
				dispatch.mock.calls[1][0].props.passages.every(
					(passage: Passage) => passage.story === state[1].id
				)
			).toBe(true);
		});
	});

	it('throws an error if more than one story to import has the same name', () => {
		toImport[0].name = toImport[1].name;
		expect(() => importStories(toImport, state)).toThrow();
	});
});
