const $ = require('jquery');
const { escape } = require('underscore');
const { expect } = require('chai');
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
			text: 'Body text which is <escaped>'
		};

		passage2 = {
			id: 'not-an-id-either',
			name: 'Another Passage',
			tags: [],
			top: 30,
			left: 45,
			text: 'More body text.\n\nAnother paragraph.'
		};

		story = {
			name: 'A Story Name Which Needs <Escaping>',
			storyFormat: 'Harlowe',
			ifid: 'not-an-ifid',
			stylesheet: '* { color: red }',
			script: 'alert("hi");',
			passages: [passage1, passage2],
			startPassage: 'not-an-id'
		};
		
		appInfo = {
			name: 'Twine Unit Tests',
			version: '29.0.1',
			buildNumber: '20500101120100'
		};
	});
	
	const checkStoryElAgainstData = ($el, story, appInfo) => {
		expect($el.attr('name')).to.equal(story.name);
		expect($el.attr('creator')).to.equal(appInfo.name);
		expect($el.attr('creator-version')).to.equal(appInfo.version);
		expect($el.attr('ifid')).to.equal(story.ifid);
		expect($el.attr('format')).to.equal(story.storyFormat);
		
		const $style = $el.find('style[type="text/twine-css"]');
		
		expect($style.length).to.equal(1);
		expect($style.html()).to.equal(story.stylesheet);
		
		const $script = $el.find('script[type="text/twine-javascript"]');
		
		expect($script.length).to.equal(1);
		expect($script.html()).to.equal(story.script);
	};

	it('publishes a passage to HTML with publishPassage()', () => {
		([passage1, passage2]).forEach(passage => {
			let result = publish.publishPassage(passage, 100);
			
			expect(result).to.be.a('string');
			
			let $result = $(result);

			expect($result.attr('pid')).to.equal('100');
			expect($result.attr('name')).to.equal(passage.name);
			expect($result.attr('tags')).to.equal(passage.tags.join(' '));
			expect($result.attr('position')).to.equal(`${passage.left},${passage.top}`);
			expect($result.text()).to.equal(passage.text);
		});
	});

	it('publishes a story with publishStory()', () => {
		const result = publish.publishStory(appInfo, story);
		
		expect(result).to.be.a('string');
		
		checkStoryElAgainstData($(result), story, appInfo);
	});
	
	it('binds a story to a format with publishStoryWithFormat()', () => {
		let result = publish.publishStoryWithFormat(
			appInfo,
			story,
			{
				properties: {
					source: '{{STORY_NAME}}'
				}
			}
		);
		
		expect(result).to.equal(escape(story.name));
		
		result = publish.publishStoryWithFormat(
			appInfo,
			story,
			{
				properties: {
					source: '{{STORY_DATA}}'
				}
			}
		);
		
		expect(result).to.be.a('string');
		
		const storyEls = $(`<div>${result}</div>`).find('tw-storydata');

		expect(storyEls.length).to.equal(1);
		checkStoryElAgainstData($(storyEls[0]), story, appInfo);	
	});

	it('publishes an archive of all stories with publishArchive()', () => {
		const result = publish.publishArchive([story, story], appInfo);

		expect(result).to.be.a('string');
		
		const storyEls = $(`<div>${result}</div>`).find('tw-storydata');
		
		expect(storyEls.length).to.equal(2);
		
		storyEls.toArray().forEach(el => {
			checkStoryElAgainstData($(el), story, appInfo);
		});
	});
});
