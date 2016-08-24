const { expect } = require('chai');
const { spy } = require('sinon');
const localStorage = require('./index');
let pref = require('./pref');
let story = require('./story');
let storyFormat = require('./story-format');

let store = {
	story: {
		stories: []
	}
};

describe('local-storage persistence', () => {
	beforeEach(() => {
		spy(pref, 'load');
		spy(pref, 'save');
		spy(story, 'load');
		spy(story, 'deleteStory');
		spy(story, 'savePassage');
		spy(story, 'saveStory');
		spy(storyFormat, 'load');
		spy(storyFormat, 'save');
	});
	
	afterEach(() => {
		pref.load.restore();
		pref.save.restore();
		story.load.restore();
		story.deleteStory.restore();
		story.savePassage.restore();
		story.saveStory.restore();
		storyFormat.load.restore();
		storyFormat.save.restore();
	});
	
	it('loads the pref, story, and story-format modules when starting', () => {	
		localStorage.onInit(store);
		expect(pref.load.calledOnce).to.be.true;
		expect(story.load.calledOnce).to.be.true;
		expect(storyFormat.load.calledOnce).to.be.true;
	});
	
	it('throws an error when given a mutation it does not know how to handle', () => {
		expect(() => { localStorage.onMutation({ type: '???' }) }).to.throw;
	});
});