const $ = require('cheerio');
const escape = require('lodash.escape');
const publish = require('./publish');

describe('publish module', () => {
	let passage1, passage2, story, appInfo;

	beforeEach(() => {
		passage1 = {
			id: 'not-an-id',
			name: 'A Name Which Needs <Escaping>',
			tags: ['tags', 'that are <escaped>'],
			top: 10,
			left: 20,
			width: 150,
			height: 150,
			text: 'Body text which is <escaped>'
		};

		passage2 = {
			id: 'not-an-id-either',
			name: 'Another Passage',
			tags: [],
			top: 30,
			left: 45,
			width: 100,
			height: 100,
			text: 'More body text.\n\nAnother paragraph.'
		};

		story = {
			name: 'A Story Name Which Needs <Escaping>',
			storyFormat: 'Harlowe',
			ifid: 'not-an-ifid',
			stylesheet: '* { color: red }',
			script: 'alert("hi");',
			passages: [passage1, passage2],
			startPassage: 'not-an-id',
			tagColors: { 'test-tag': 'red' },
			zoom: 1.5
		};
		
		appInfo = {
			name: 'Twine Unit Tests',
			version: '29.0.1',
			buildNumber: '20500101120100'
		};
	});
	
	const checkStoryElAgainstData = ($el, story, appInfo) => {
		expect($el.attr('name')).toBe(story.name);
		expect($el.attr('creator')).toBe(appInfo.name);
		expect($el.attr('creator-version')).toBe(appInfo.version);
		expect($el.attr('ifid')).toBe(story.ifid);
		expect($el.attr('format')).toBe(story.storyFormat);
		expect($el.attr('zoom')).toBe(story.zoom.toString());
		
		const $style = $el.find('style[type="text/twine-css"]');
		
		expect($style.length).toBe(1);
		expect($style.html()).toBe(story.stylesheet);
		
		const $script = $el.find('script[type="text/twine-javascript"]');
		
		expect($script.length).toBe(1);
		expect($script.html()).toBe(story.script);

		const $tags = $el.find('tw-tag');

		expect($tags.length).toBe(1);
		expect($($tags[0]).attr('name')).toBe('test-tag');
		expect($($tags[0]).attr('color')).toBe('red');		

		const $passages = $el.children('tw-passagedata');
		expect($passages.length).toBe(2);
	};

	test('publishes a passage to HTML with publishPassage()', () => {
		([passage1, passage2]).forEach(passage => {
			let result = publish.publishPassage(passage, 100);
			
			expect(typeof result).toBe('string');
			
			let $result = $(result);

			expect($result.attr('pid')).toBe('100');
			expect($result.attr('name')).toBe(passage.name);
			expect($result.attr('tags')).toBe(passage.tags.join(' '));
			expect($result.attr('position')).toBe(`${passage.left},${passage.top}`);
			expect($result.attr('size')).toBe(`${passage.width},${passage.height}`);
			expect($result.text()).toBe(passage.text);
		});
	});

	test('publishes a story with publishStory()', () => {
		const result = publish.publishStory(appInfo, story);
		
		expect(typeof result).toBe('string');
		console.info(result);
		checkStoryElAgainstData($(result), story, appInfo);
	});
	
	test('binds a story to a format with publishStoryWithFormat()', () => {
		let result = publish.publishStoryWithFormat(
			appInfo,
			story,
			{
				properties: {
					source: '{{STORY_NAME}}'
				}
			}
		);
		
		expect(result).toBe(escape(story.name));
		
		result = publish.publishStoryWithFormat(
			appInfo,
			story,
			{
				properties: {
					source: '{{STORY_DATA}}'
				}
			}
		);
		
		expect(typeof result).toBe('string');
		
		const storyEls = $(`<div>${result}</div>`).find('tw-storydata');

		expect(storyEls.length).toBe(1);
		checkStoryElAgainstData($(storyEls[0]), story, appInfo);
	});

	test('publishes an archive of all stories with publishArchive()', () => {
		const result = publish.publishArchive([story, story], appInfo);

		expect(typeof result).toBe('string');
		
		const storyEls = $(`<div>${result}</div>`).find('tw-storydata');
		
		expect(storyEls.length).toBe(2);
		
		storyEls.toArray().forEach(el => {
			checkStoryElAgainstData($(el), story, appInfo);
		});
	});
});
