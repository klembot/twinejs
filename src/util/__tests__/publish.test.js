import escape from 'lodash.escape';
import * as publish from '../publish';
import {
	fakeAppInfoObject,
	fakePassageObject,
	fakeStoryObject
} from '@/test-utils/fakes';

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

	expect(tagEls.length).toBe(story.tags.length);

	story.tags.forEach((tag, index) => {
		expect(tagEls[index].getAttribute('name')).toBe(tag);
		expect(tagEls[index].getAttribute('color')).toBe(story.tagColors[tag]);
	});

	const passageEls = el.querySelectorAll('tw-passagedata');

	story.passages.forEach((passage, index) =>
		checkPassageElAgainstData(passageEls[index], passage)
	);
}

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

describe('publishPassage()', () => {
	it('publishes a passage to HTML', () => {
		const passage = fakePassageObject();
		const result = publish.publishPassage(passage, 100);

		expect(typeof result).toBe('string');
		checkPassageElAgainstData(toDOM(result), passage);
	});
});

describe('publishStory()', () => {
	it('publishes a story to HTML', () => {
		const result = publish.publishStory(story, appInfo);

		expect(typeof result).toBe('string');
		checkStoryElAgainstData(toDOM(result), story, appInfo);
	});

	it('passes through format options', () => {
		const result = toDOM(
			publish.publishStory(story, appInfo, {
				formatOptions: '<<test option>>'
			})
		);

		expect(result.getAttribute('options')).toBe('<<test option>>');
	});

	it('allows overriding the starting passage', () => {
		const result = toDOM(
			publish.publishStory(story, appInfo, {
				startId: story.passages[1].id
			})
		);

		const startPassageData = result.querySelector(
			`tw-passagedata[name="${story.passages[1].name}"]`
		);

		expect(result.getAttribute('startnode')).toBe(
			startPassageData.getAttribute('pid')
		);
	});

	it('throws an error if the story has no starting point and one is not overridden', () => {
		story.startPassage = undefined;
		expect(() => publish.publishStory(story, appInfo)).toThrow();
	});

	describe('when the starting passage does not exist', () => {
		it('throws an error if start is not optional', () => {
			story.startPassage = 'nonexistent';
			expect(() => publish.publishStory(story, appInfo)).toThrow();
		});

		it("doesn't throw an error if start is optional", () => {
			story.startPassage = 'nonexistent';
			expect(() =>
				publish.publishStory(story, appInfo, {startOptional: true})
			).not.toThrow();
		});
	});
});

describe('publishStoryWithFormat()', () => {
	it('binds a story to a format', () => {
		let result = publish.publishStoryWithFormat(
			story,
			'{{STORY_NAME}}',
			appInfo
		);

		expect(result).toBe(escape(story.name));
		result = publish.publishStoryWithFormat(story, '{{STORY_DATA}}', appInfo);
		expect(typeof result).toBe('string');
		checkStoryElAgainstData(toDOM(result), story, appInfo);
	});
});
