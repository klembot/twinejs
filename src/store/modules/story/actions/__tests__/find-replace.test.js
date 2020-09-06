import {actionCommits} from '@/test-utils/vuex';
import {fakeStoryObject} from '@/test-utils/fakes';
import {replaceInPassage, replaceInStory} from '../find-replace';

let story;
const getters = {
	storyWithId(id) {
		if (id === story.id) {
			return story;
		}
	}
};

const testPassages = [
	{
		name: 'Passage 1 Name',
		text: 'Passage 1 Text'
	},
	{
		name: 'Passage 2 Name',
		text: 'Passage 2 Text'
	}
];

function replaceInPassageAction(passage, props) {
	return [
		replaceInPassage,
		{...props, passageId: passage.id, storyId: story.id},
		getters
	];
}

function replaceInStoryAction(props) {
	return [replaceInStory, {...props, storyId: story.id}, getters];
}

function updateCommit(passage, passageProps) {
	return [
		'updatePassage',
		{passageProps, passageId: passage.id, storyId: story.id}
	];
}

beforeEach(() => {
	story = fakeStoryObject(2);
	Object.assign(story.passages[0], testPassages[0]);
	Object.assign(story.passages[1], testPassages[1]);
});

describe('replaceInPassage action', () => {
	it('replaces in passage text', () => {
		/* Single replacement. */

		expect(
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: 'Passage 1',
					replace: 'Replace'
				})
			)
		).toEqual([updateCommit(story.passages[0], {text: 'Replace Text'})]);

		/* Multiple replacement. */

		Object.assign(story.passages[0], testPassages[0]);

		expect(
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: 'e',
					replace: '*'
				})
			)
		).toEqual([updateCommit(story.passages[0], {text: 'Passag* 1 T*xt'})]);
	});

	it('does nothing if there is no match in passage text', () =>
		expect(
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: 'no match',
					replace: ''
				})
			)
		).toEqual([]));

	it('does not interpret regular expression characters', () => {
		/* In search only. */

		expect(
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: '.',
					replace: '*'
				})
			)
		).toEqual([]);

		/*
		In replace.
		See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
		*/

		expect(
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: 'Passage 1',
					replace: '$&'
				})
			)
		).toEqual([updateCommit(story.passages[0], {text: '$& Text'})]);
	});

	describe('when includePassageNames is true', () => {
		it('replaces in the passage name', () => {
			expect(
				actionCommits(
					...replaceInPassageAction(story.passages[0], {
						includePassageNames: true,
						search: 'Passage 1',
						replace: 'Replace'
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					name: 'Replace Name',
					text: 'Replace Text'
				})
			]);
		});

		it('does nothing if there is no match in either passage text or name', () =>
			expect(
				actionCommits(
					...replaceInPassageAction(story.passages[0], {
						includePassageNames: true,
						search: 'no match',
						replace: ''
					})
				)
			).toEqual([]));
	});

	describe('when matchCase is true', () => {
		it('replaces in passage text in a case-sensitive way', () =>
			expect(
				actionCommits(
					...replaceInPassageAction(story.passages[0], {
						matchCase: true,
						search: 'Passage 1',
						replace: 'Replace'
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					text: 'Replace Text'
				})
			]));

		it('does nothing if there is no match in passage text', () =>
			expect(
				actionCommits(
					...replaceInPassageAction(story.passages[0], {
						matchCase: true,
						search: 'PASSAGE 1',
						replace: 'Replace'
					})
				)
			).toEqual([]));

		describe('when includePassageNames is also true', () => {
			it('replaces in the passage name in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							includePassageNames: true,
							matchCase: true,
							search: 'Passage 1',
							replace: 'Replace'
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'Replace Name',
						text: 'Replace Text'
					})
				]));

			it('replaces all instances in the passage name in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							includePassageNames: true,
							matchCase: true,
							search: 'P',
							replace: 'R'
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'Rassage 1 Name',
						text: 'Rassage 1 Text'
					})
				]));

			it('does nothing if there is no match in either passage text or name', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							includePassageNames: true,
							matchCase: true,
							search: 'E',
							replace: '*'
						})
					)
				).toEqual([]));
		});
	});

	describe('when useRegexes is true', () => {
		it('replaces using regular expressions', () =>
			expect(
				actionCommits(
					...replaceInPassageAction(story.passages[0], {
						search: '[a-zA-Z]',
						replace: '$&_',
						useRegexes: true
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					text: 'P_a_s_s_a_g_e_ 1 T_e_x_t_'
				})
			]));

		describe('when includePassageNames is also true', () => {
			it('replaces in passage names using regular expressions', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							includePassageNames: true,
							search: '[a-zA-Z]',
							replace: '$&_',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'P_a_s_s_a_g_e_ 1 N_a_m_e_',
						text: 'P_a_s_s_a_g_e_ 1 T_e_x_t_'
					})
				]));
		});

		describe('when matchCase is also true', () => {
			it('replaces in passage text in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							matchCase: true,
							search: 'P.*?',
							replace: 'Replace$&',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						text: 'ReplacePassage 1 Text'
					})
				]));
		});

		describe('when includePassageNames and matchCase are also true', () => {
			it('replaces in passage names and text in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInPassageAction(story.passages[0], {
							includePassageNames: true,
							matchCase: true,
							search: 'P.*?',
							replace: 'Replace$&',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'ReplacePassage 1 Name',
						text: 'ReplacePassage 1 Text'
					})
				]));
		});
	});

	it('throws an error if search is not a string', () => {
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: undefined,
					replace: ''
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: 1,
					replace: ''
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: null,
					replace: ''
				})
			)
		).toThrow();
	});

	it('throws an error if replace is not a string', () => {
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: '',
					replace: undefined
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: '',
					replace: 1
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInPassageAction(story.passages[0], {
					search: '',
					replace: null
				})
			)
		).toThrow();
	});

	it('throws an error if there is no passage with the given ID in the story', () =>
		expect(() =>
			actionCommits(
				replaceInPassage,
				{
					passageId: 'nonexistent',
					replace: '',
					search: '',
					storyId: story.id
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				replaceInPassage,
				{
					passageId: story.passages[0].id,
					replace: '',
					search: '',
					storyId: 'nonexistent'
				},
				getters
			)
		).toThrow());
});

describe('replaceInStory action', () => {
	it('replaces in passage text', () => {
		/* Single replacement. */

		expect(
			actionCommits(
				...replaceInStoryAction({
					search: 'Passage',
					replace: 'Replace'
				})
			)
		).toEqual([
			updateCommit(story.passages[0], {text: 'Replace 1 Text'}),
			updateCommit(story.passages[1], {text: 'Replace 2 Text'})
		]);

		/* Multiple replacement. */

		Object.assign(story.passages[0], testPassages[0]);
		Object.assign(story.passages[1], testPassages[1]);

		expect(
			actionCommits(
				...replaceInStoryAction({
					search: 'e',
					replace: '*'
				})
			)
		).toEqual([
			updateCommit(story.passages[0], {text: 'Passag* 1 T*xt'}),
			updateCommit(story.passages[1], {text: 'Passag* 2 T*xt'})
		]);
	});

	it('does nothing if there is no match in passage text', () =>
		expect(
			actionCommits(
				...replaceInStoryAction({
					search: 'no match',
					replace: ''
				})
			)
		).toEqual([]));

	it('does not interpret regular expression characters', () => {
		/* In search only. */

		expect(
			actionCommits(
				...replaceInStoryAction({
					search: '.',
					replace: '*'
				})
			)
		).toEqual([]);

		/*
		In replace.
		See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
		*/

		expect(
			actionCommits(
				...replaceInStoryAction({
					search: 'Passage',
					replace: '$&'
				})
			)
		).toEqual([
			updateCommit(story.passages[0], {text: '$& 1 Text'}),
			updateCommit(story.passages[1], {text: '$& 2 Text'})
		]);
	});

	describe('when includePassageNames is true', () => {
		it('replaces in the passage name', () => {
			expect(
				actionCommits(
					...replaceInStoryAction({
						includePassageNames: true,
						search: 'Passage',
						replace: 'Replace'
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					name: 'Replace 1 Name',
					text: 'Replace 1 Text'
				}),
				updateCommit(story.passages[1], {
					name: 'Replace 2 Name',
					text: 'Replace 2 Text'
				})
			]);
		});

		it('does nothing if there is no match in either passage text or name', () =>
			expect(
				actionCommits(
					...replaceInStoryAction({
						includePassageNames: true,
						search: 'no match',
						replace: ''
					})
				)
			).toEqual([]));
	});

	describe('when matchCase is true', () => {
		it('replaces in passage text in a case-sensitive way', () =>
			expect(
				actionCommits(
					...replaceInStoryAction({
						matchCase: true,
						search: 'Passage',
						replace: 'Replace'
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					text: 'Replace 1 Text'
				}),
				updateCommit(story.passages[1], {
					text: 'Replace 2 Text'
				})
			]));

		it('does nothing if there is no match in passage text', () =>
			expect(
				actionCommits(
					...replaceInStoryAction({
						matchCase: true,
						search: 'PASSAGE',
						replace: 'Replace'
					})
				)
			).toEqual([]));

		describe('when includePassageNames is also true', () => {
			it('replaces in the passage name in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							includePassageNames: true,
							matchCase: true,
							search: 'Passage',
							replace: 'Replace'
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'Replace 1 Name',
						text: 'Replace 1 Text'
					}),
					updateCommit(story.passages[1], {
						name: 'Replace 2 Name',
						text: 'Replace 2 Text'
					})
				]));

			it('replaces all instances in the passage name in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							includePassageNames: true,
							matchCase: true,
							search: 'P',
							replace: 'R'
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'Rassage 1 Name',
						text: 'Rassage 1 Text'
					}),
					updateCommit(story.passages[1], {
						name: 'Rassage 2 Name',
						text: 'Rassage 2 Text'
					})
				]));

			it('does nothing if there is no match in either passage text or name', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							includePassageNames: true,
							matchCase: true,
							search: 'E',
							replace: '*'
						})
					)
				).toEqual([]));
		});
	});

	describe('when useRegexes is true', () => {
		it('replaces using regular expressions', () =>
			expect(
				actionCommits(
					...replaceInStoryAction({
						search: '[a-zA-Z]',
						replace: '$&_',
						useRegexes: true
					})
				)
			).toEqual([
				updateCommit(story.passages[0], {
					text: 'P_a_s_s_a_g_e_ 1 T_e_x_t_'
				}),
				updateCommit(story.passages[1], {
					text: 'P_a_s_s_a_g_e_ 2 T_e_x_t_'
				})
			]));

		describe('when includePassageNames is also true', () => {
			it('replaces in passage names using regular expressions', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							includePassageNames: true,
							search: '[a-zA-Z]',
							replace: '$&_',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'P_a_s_s_a_g_e_ 1 N_a_m_e_',
						text: 'P_a_s_s_a_g_e_ 1 T_e_x_t_'
					}),
					updateCommit(story.passages[1], {
						name: 'P_a_s_s_a_g_e_ 2 N_a_m_e_',
						text: 'P_a_s_s_a_g_e_ 2 T_e_x_t_'
					})
				]));
		});

		describe('when matchCase is also true', () => {
			it('replaces in passage text in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							matchCase: true,
							search: 'P.*?',
							replace: 'Replace$&',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						text: 'ReplacePassage 1 Text'
					}),
					updateCommit(story.passages[1], {
						text: 'ReplacePassage 2 Text'
					})
				]));
		});

		describe('when includePassageNames and matchCase are also true', () => {
			it('replaces in passage names and text in a case-sensitive way', () =>
				expect(
					actionCommits(
						...replaceInStoryAction({
							includePassageNames: true,
							matchCase: true,
							search: 'P.*?',
							replace: 'Replace$&',
							useRegexes: true
						})
					)
				).toEqual([
					updateCommit(story.passages[0], {
						name: 'ReplacePassage 1 Name',
						text: 'ReplacePassage 1 Text'
					}),
					updateCommit(story.passages[1], {
						name: 'ReplacePassage 2 Name',
						text: 'ReplacePassage 2 Text'
					})
				]));
		});
	});

	it('throws an error if search is not a string', () => {
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: undefined,
					replace: ''
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: 1,
					replace: ''
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: null,
					replace: ''
				})
			)
		).toThrow();
	});

	it('throws an error if replace is not a string', () => {
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: '',
					replace: undefined
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: '',
					replace: 1
				})
			)
		).toThrow();
		expect(() =>
			actionCommits(
				...replaceInStoryAction({
					search: '',
					replace: null
				})
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				replaceInStory,
				{
					replace: '',
					search: '',
					storyId: 'nonexistent'
				},
				getters
			)
		).toThrow());
});
