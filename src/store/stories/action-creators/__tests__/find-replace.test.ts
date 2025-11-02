import {
	passageReplaceError,
	replaceInPassage,
	replaceInStory
} from '../find-replace';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('passageReplaceError', () => {
	it('returns an error if the search criteria is an invalid regexp and that flag is enabled', () => {
		const story = fakeStory();

		expect(
			passageReplaceError(story.passages, '(', '', {useRegexes: true})
		).toEqual({error: 'invalidRegex'});
	});

	it('returns an error if a passage name would become an empty string using a plain replace', () => {
		const story = fakeStory();

		story.passages[0].name = 'a ';
		expect(
			passageReplaceError(story.passages, 'a', '', {
				includePassageNames: true
			})
		).toEqual({passage: story.passages[0], error: 'emptyName'});
	});

	it('returns an error if a passage name would become an empty string using a regex', () => {
		const story = fakeStory();

		story.passages[0].name = 'ab';
		expect(
			passageReplaceError(story.passages, '.', '', {
				includePassageNames: true,
				useRegexes: true
			})
		).toEqual({passage: story.passages[0], error: 'emptyName'});
	});

	it('returns an error if two passage names would conflict using a plain replace', () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[1].name = 'a1';
		expect(
			passageReplaceError(story.passages, '1', '', {
				includePassageNames: true
			})
		).toEqual({passage: story.passages[1], error: 'nameConflict'});
	});

	it('returns an error if two passage names would conflict using a regex', () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[1].name = 'a1';
		expect(
			passageReplaceError(story.passages, '\\d', '', {
				includePassageNames: true,
				useRegexes: true
			})
		).toEqual({passage: story.passages[1], error: 'nameConflict'});
	});

	it('returns an error if the search criteria is an invalid regexp but that flag is disabled', () => {
		const story = fakeStory();

		expect(
			passageReplaceError(story.passages, '(', '', {useRegexes: false})
		).toBeUndefined();
	});

	it("returns undefined if the replace won't cause a name conflict or empty passage name", () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[1].name = 'b';
		expect(
			passageReplaceError(story.passages, 'b', 'c', {
				includePassageNames: true
			})
		).toBeUndefined();
	});

	it('returns undefined if passage names are not being replaced, even if otherwise there would be a conflict', () => {
		const story = fakeStory(2);

		story.passages[0].name = 'a';
		story.passages[1].name = 'b1';
		expect(
			passageReplaceError(story.passages, 'b1', 'a', {
				includePassageNames: false
			})
		).toBeUndefined();
	});

	it('returns undefined if passage names are not being replaced, even if it would cause passages to have an empty name', () => {
		const story = fakeStory();

		story.passages[0].name = 'a';
		expect(
			passageReplaceError(story.passages, 'a', '', {
				includePassageNames: false
			})
		).toBeUndefined();
	});
});

describe('replaceInPassage', () => {
	let dispatch: jest.Mock;
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory();
		passage = story.passages[0];
		passage.text = 'AaBbCc';
		passage.name = 'AaYyZz';
	});

	it.each([
		['a', '*', {}, {text: '**BbCc'}],
		['no match', '*', {}, undefined],
		['.', '*', {}, undefined],
		['x', '*', {}, undefined],
		['a', '*', {matchCase: true}, {text: 'A*BbCc'}],
		['a', '*', {includePassageNames: true}, {name: '**YyZz', text: '**BbCc'}],
		['b', '*', {includePassageNames: true}, {text: 'Aa**Cc'}],
		[
			'a',
			'*',
			{includePassageNames: true, matchCase: true},
			{name: 'A*YyZz', text: 'A*BbCc'}
		],
		['\\w', '*', {useRegexes: true}, {text: '******'}],
		['a.', '*', {matchCase: true, useRegexes: true}, {text: 'A*bCc'}],
		[
			'a.',
			'*',
			{includePassageNames: true, matchCase: true, useRegexes: true},
			{name: 'A*yZz', text: 'A*bCc'}
		],
		[
			'a.',
			'*',
			{includePassageNames: true, useRegexes: true},
			{name: '*YyZz', text: '*BbCc'}
		]
	])(
		'when asked to replace "%s" with "%s" (flags %j), dispatches %j',
		(search, replace, flags, props) => {
			replaceInPassage(
				story,
				passage,
				search,
				replace,
				flags
			)(dispatch, () => [story]);

			expect.assertions(1);

			if (props) {
				// Tests here are loose because passage text updates trigger other
				// potential dispatches (e.g. to add newly-linked passages).

				// eslint-disable-next-line jest/no-conditional-expect
				expect(dispatch).toHaveBeenCalledWith({
					props,
					type: 'updatePassage',
					passageId: passage.id,
					storyId: story.id
				});
			} else {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(dispatch).not.toHaveBeenCalled();
			}
		}
	);

	it('throws an error if the passage does not belong to the story', () => {
		story.passages[0].story = 'bad';
		expect(() =>
			replaceInPassage(story, passage, 'a', 'b', {})(dispatch, () => [story])
		).toThrow();
	});

	it('throws an error if search is an empty string', () =>
		expect(() =>
			replaceInPassage(story, passage, '', 'a', {})(dispatch, () => [story])
		).toThrow());
});

describe('replaceInStory', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(2);
		story.passages[0].text = 'AaBbCc';
		story.passages[0].name = 'AaYyZz';
		story.passages[1].text = 'AaDdEe';
		story.passages[1].name = 'AaWwXx';
	});

	it.each([
		['a', '*', {}, [[{text: '**BbCc'}], [{text: '**DdEe'}]]],
		['no match', '*', {}, undefined],
		['.', '*', {}, undefined],
		['x', '*', {}, undefined],
		['a', '*', {matchCase: true}, [[{text: 'A*BbCc'}], [{text: 'A*DdEe'}]]],
		[
			'a',
			'*',
			{includePassageNames: true},
			[
				[{name: '**YyZz'}, {text: '**BbCc'}],
				[{name: '**WwXx'}, {text: '**DdEe'}]
			]
		],
		['b', '*', {includePassageNames: true}, [[{text: 'Aa**Cc'}]]],
		[
			'a',
			'*',
			{includePassageNames: true, matchCase: true},
			[
				[{name: 'A*YyZz'}, {text: 'A*BbCc'}],
				[{name: 'A*WwXx'}, {text: 'A*DdEe'}]
			]
		],
		['\\w', '*', {useRegexes: true}, [[{text: '******'}], [{text: '******'}]]],
		[
			'a.',
			'*',
			{matchCase: true, useRegexes: true},
			[[{text: 'A*bCc'}], [{text: 'A*dEe'}]]
		],
		[
			'a.',
			'*',
			{includePassageNames: true, matchCase: true, useRegexes: true},
			[
				[{name: 'A*yZz'}, {text: 'A*bCc'}],
				[{name: 'A*wXx'}, {text: 'A*dEe'}]
			]
		],
		[
			'a.',
			'*',
			{includePassageNames: true, useRegexes: true},
			[
				[{name: '*YyZz'}, {text: '*BbCc'}],
				[{name: '*WwXx'}, {text: '*DdEe'}]
			]
		]
	])(
		'when asked to replace "%s" with "%s" (flags %j), dispatches %j',
		(search, replace, flags, passageChanges) => {
			replaceInStory(story, search, replace, flags)(dispatch, () => [story]);

			if (passageChanges) {
				// Tests here are loose because passage text updates trigger other
				// potential dispatches (e.g. to add newly-linked passages).

				for (const props of passageChanges[0]) {
					// eslint-disable-next-line jest/no-conditional-expect
					expect(dispatch).toHaveBeenCalledWith({
						props,
						type: 'updatePassage',
						passageId: story.passages[0].id,
						storyId: story.id
					});
				}

				if (passageChanges.length > 1) {
					for (const props of passageChanges[1]) {
						// eslint-disable-next-line jest/no-conditional-expect
						expect(dispatch).toHaveBeenCalledWith({
							props,
							type: 'updatePassage',
							passageId: story.passages[1].id,
							storyId: story.id
						});
					}
				}
			} else {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(dispatch).not.toHaveBeenCalled();
			}
		}
	);

	it('replaces passage names before passage text', () => {
		story = fakeStory(2);
		story.passages[0].name = 'passage 1';
		story.passages[0].text = '[[test->passage 2]]';
		story.passages[1].name = 'passage 2';
		story.passages[1].text = 'test';

		replaceInStory(story, 'passage', 'X', {includePassageNames: true})(
			dispatch,
			() => [story]
		);

		// The order of calls matters here. There are some additional calls after
		// this related to passage creation that don't matter to this test.

		expect(dispatch.mock.calls[0]).toEqual([
			{
				type: 'updatePassage',
				passageId: story.passages[0].id,
				props: {name: 'X 1'},
				storyId: story.id
			}
		]);
		expect(dispatch.mock.calls[1]).toEqual([
			{
				type: 'updatePassage',
				passageId: story.passages[1].id,
				props: {name: 'X 2'},
				storyId: story.id
			}
		]);
		expect(dispatch.mock.calls[2]).toEqual([
			{
				type: 'updatePassage',
				passageId: story.passages[0].id,
				props: {text: '[[test->X 2]]'},
				storyId: story.id
			}
		]);
	});
});
