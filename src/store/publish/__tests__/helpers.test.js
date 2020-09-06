import escape from 'lodash.escape';
import * as publish from '../helpers';
import * as fileSaver from 'file-saver';
import {
	fakeAppInfoObject,
	fakePassageObject,
	fakeStoryObject
} from '@/test-utils/fakes';

jest.mock('file-saver');

function toDOM(htmlSource, dive = true) {
	const container = document.createElement('div');

	container.innerHTML = htmlSource;
	return dive ? container.firstChild : container;
}

/*
	See https://github.com/iftechfoundation/twine-specs/blob/master/twine-2-htmloutput-spec.md
	*/

function checkPassageElAgainstData(el, passage) {
	expect(parseInt(el.getAttribute('pid'))).not.toBeNaN();
	expect(el.getAttribute('name')).toBe(passage.name);
	expect(el.getAttribute('tags')).toBe(passage.tags.join(' '));
	expect(el.getAttribute('position')).toBe(`${passage.left},${passage.top}`);
	expect(el.getAttribute('size')).toBe(`${passage.width},${passage.height}`);
}

function checkStoryElAgainstData(el, story, appInfo) {
	expect(el.getAttribute('name')).toBe(story.name);
	expect(el.getAttribute('creator')).toBe(appInfo.name);
	expect(el.getAttribute('creator-version')).toBe(appInfo.version);
	expect(el.getAttribute('ifid')).toBe(story.ifid);
	expect(el.getAttribute('format')).toBe(story.storyFormat);
	expect(el.getAttribute('format-version')).toBe(story.storyFormatVersion);
	expect(el.getAttribute('zoom')).toBe(story.zoom.toString());

	const styleEls = el.querySelectorAll('[type="text/twine-css"]');

	expect(styleEls.length).toBe(1);
	expect(styleEls[0].innerHTML).toBe(story.stylesheet);

	const scriptEls = el.querySelectorAll('[type="text/twine-javascript"]');

	expect(scriptEls.length).toBe(1);
	expect(scriptEls[0].innerHTML).toBe(story.script);

	const tagEls = el.querySelectorAll('tw-tag');

	story.tags.forEach((tag, index) => {
		expect(tagEls[index].getAttribute('name')).toBe(tag);
		expect(tagEls[index].getAttribute('color')).toBe(story.tagColors[tag]);
	});

	const passageEls = el.querySelectorAll('tw-passagedata');

	story.passages.forEach((passage, index) =>
		checkPassageElAgainstData(passageEls[index], passage)
	);
}

describe('publish helpers', () => {
	let appInfo, story;

	beforeEach(() => {
		appInfo = fakeAppInfoObject();
		story = fakeStoryObject(2);
		Object.assign(story.passages[0], {
			name: 'A Name Which Needs <Escaping>',
			tags: ['tags', 'that are <escaped>'],
			text: 'Body text which is <escaped>'
		});
		Object.assign(story.passages[1], {
			tags: [],
			text: 'More body text.\n\nAnother paragraph.'
		});
	});

	describe('publishArchive()', () => {
		it('publishes an archive of all stories', () => {
			const result = publish.publishArchive([story, story], appInfo);

			expect(typeof result).toBe('string');

			const storyEls = toDOM(result, false).querySelectorAll('tw-storydata');

			expect(storyEls.length).toBe(2);

			Array.from(storyEls).forEach(el =>
				checkStoryElAgainstData(el, story, appInfo)
			);
		});
	});

	describe('publishArchiveToFile()', () => {
		it('publishes an archive of all stories', async () => {
			publish.publishArchiveToFile([story, story], appInfo);

			/*
			It seems we can't dig into the Blob inside jsdom.
			*/

			expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
			expect(fileSaver.saveAs.mock.calls[0][0]).toBeInstanceOf(Blob);
			expect(fileSaver.saveAs.mock.calls[0][1]).toContain(
				'store.archiveFilename'
			);
		});
	});

	describe('publishPassage()', () => {
		it('publishes a passage to HTML', () => {
			const passage = fakePassageObject();
			const result = publish.publishPassage(passage, 100);

			expect(typeof result).toBe('string');
			checkPassageElAgainstData(toDOM(result), passage);
		});
	});

	describe('publishStory()', () => {
		it('publishes a story with publishStory()', () => {
			const result = publish.publishStory(appInfo, story);

			expect(typeof result).toBe('string');
			checkStoryElAgainstData(toDOM(result), story, appInfo);
		});

		it.todo('passes through format options');
		it.todo('allows overriding the starting passage');
		it.todo(
			'throws an error if the story has no starting point and one is not overridden'
		);

		describe('when the starting passage does not exist', () => {
			it.todo('throws an error if start is not optional');
			it.todo("doesn't throw an error if start is optional");
		});

		it.todo(
			'throws an error if the start passage does not exist and it is not optional'
		);
		it.todo("doesn't throw an error if there is no start passage.");
	});

	describe('publishStoryWithFormat()', () => {
		it('binds a story to a format', () => {
			let result = publish.publishStoryWithFormat(appInfo, story, {
				properties: {
					source: '{{STORY_NAME}}'
				}
			});

			expect(result).toBe(escape(story.name));

			result = publish.publishStoryWithFormat(appInfo, story, {
				properties: {
					source: '{{STORY_DATA}}'
				}
			});

			expect(typeof result).toBe('string');
			checkStoryElAgainstData(toDOM(result), story, appInfo);
		});

		it('throws an error if the format has no source property', () =>
			expect(() =>
				publish.publishStoryWithFormat(appInfo, story, {
					properties: {}
				})
			).toThrow());
	});
});
