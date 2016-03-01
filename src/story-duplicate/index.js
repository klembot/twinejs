/**
 Duplicates this model and its passages.

 @method duplicate
 @param {String} name new name of the story
 @return {Story} new Story model
**/

var PassageCollection = require('../data/collections/passage');
var StoryCollection = require('../data/collections/story');

module.exports = function(story, name) {
	var storyC = new StoryCollection();
	var passageC = new PassageCollection();

	var dupeStory = story.clone();

	dupeStory.unset('id');
	dupeStory.collection = storyC;
	dupeStory.save({ name: name }, { wait: true });

	var startPassageId = story.get('startPassage');
	var newStart;

	this.fetchPassages().each(orig => {
		var dupePassage = orig.clone();

		dupePassage.unset('id');
		dupePassage.collection = passageC;

		// we do this in two steps to avoid an ugly bug
		// with passage validation; it needs to verify
		// that our name isn't duplicated, but it can
		// only do this by looking up the story with its ID,
		// not by consulting the attrs hash passed to it

		dupePassage.set('story', dupeStory.id);
		dupePassage.save();

		if (orig.id == startPassageId) {
			newStart = dupePassage;
		}
	});

	if (newStart) {
		dupeStory.save({ startPassage: newStart.id });
	}

	return dupeStory;
};
