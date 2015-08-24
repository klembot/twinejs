'use strict';
var _ = require('underscore');
var assert = require('selenium-webdriver/testing/assert');
var firefox = require('selenium-webdriver/firefox');
var phantomjs = require('selenium-webdriver/phantomjs');
var test = require('selenium-webdriver/testing');
var until = require('selenium-webdriver').until;

var SHORT_UNI = 'A good day, World! Schönen Tag, Welt! Une bonne journée, tout le monde! يوم جيد، العالم 좋은 일, 세계! Một ngày tốt lành, thế giới! こんにちは、世界！';

test.describe('StoryListView', function()
{
	var dr;
	var testUrl = 'file://' + __dirname.replace('/tests/selenium', '') + '/build/standalone/index.html';
	this.timeout(10000);

	test.beforeEach(function()
	{
		dr = new firefox.Driver();
		dr.get(testUrl + '#stories');
	});

	test.afterEach(function()
	{
		dr.quit();
	});

	function createStory (dontReturn)
	{
		var addButton = dr.findElement({ css: '.addStory' });
		var bubble = addButton.findElement({ xpath: '../..' }).findElement({ css: '.bubble '});
		addButton.click();

		dr.wait(until.elementIsVisible(bubble))
		.then(function()
		{
			var nameField = bubble.findElement({ css: '.newName' });
			var addSubmitButton = bubble.findElement({ css: '.add' });

			nameField.sendKeys(SHORT_UNI);
			addSubmitButton.click();

			dr.wait(until.stalenessOf(bubble));

			if (! dontReturn)
			{
				dr.wait(until.elementLocated({ css: '#storyEditView' }));
				dr.get(testUrl + '#stories');
				dr.wait(until.elementLocated({ css: '#storyListView' }));
			};
		});
	};

	test.it('Is on the #stories route', function()
	{
		assert(dr.isElementPresent({ css: '#regions #storyListView' })).isTrue();
	});

	test.it('Shows initial message when no stories are saved', function()
	{
		dr.wait(until.elementLocated({ css: '.noStories' }))
		.then(function()
		{
			var noStories = dr.findElement({ css: '.noStories' });
			dr.wait(until.elementIsVisible(noStories));
		});
	});

	test.it('Can cancel out of adding a new story', function()
	{
		var addButton = dr.findElement({ css: '.addStory' });
		var bubble = addButton.findElement({ xpath: '../..' }).findElement({ css: '.bubble '});

		addButton.click();
		dr.wait(until.elementIsVisible(bubble));
		dr.findElement({ css: '.cancelAdd' }).click();
		dr.wait(until.elementIsNotVisible(bubble));
	});

	test.it('Does not allow blank story names', function()
	{
		var addButton = dr.findElement({ css: '.addStory' });
		var bubble = addButton.findElement({ xpath: '../..' }).findElement({ css: '.bubble '});

		addButton.click();
		dr.wait(until.elementIsVisible(bubble));
		dr.findElement({ css: '.add' }).click();
		assert(bubble.isDisplayed()).isTrue();
	});

	test.it('Can add a new story', function()
	{
		createStory(true);
		dr.wait(until.elementLocated({ css: '.storyName' }));
		assert(dr.findElement({ css: '.storyName' }).getText()).equalTo(SHORT_UNI);
	});

	test.it('Can play a story', function()
	{
		createStory();
		dr.findElement({ css: '.story button[data-bubble="toggle"]' }).click();
		dr.findElement({ css: '.story .menu .play' }).click();
		dr.getAllWindowHandles(function (windows)
		{
			assert(_.contains(windows, SHORT_UNI)).isTrue();
		});
	});

	test.it('Can test a story', function()
	{
		createStory();
		dr.findElement({ css: '.story button[data-bubble="toggle"]' }).click();
		dr.findElement({ css: '.story .menu .test' }).click();
		dr.getAllWindowHandles(function (windows)
		{
			assert(_.contains(windows, SHORT_UNI)).isTrue();
		});
	});

	test.it('Can rename a story', function()
	{
		createStory();
		dr.findElement({ css: '.story button[data-bubble="toggle"]' }).click();
		dr.findElement({ css: '.story .menu .rename' }).click();
		dr.wait(until.elementLocated({ css: '.prompt input[type="text"]' }))

		var promptEl = dr.findElement({ css: '.prompt' });

		dr.findElement({ css: '.prompt input[type="text"]' }).sendKeys('123 ' + SHORT_UNI);
		dr.findElement({ css: '.prompt button[data-action="yes"]' }).click();

		dr.wait(until.elementIsNotVisible(promptEl));
		assert(dr.findElement({ css: '.story h2' }).getText()).equalTo('123 ' + SHORT_UNI);
	});

	test.it('Can cancel out of deleting a story', function()
	{
		createStory();
		dr.findElement({ css: '.story button[data-bubble="toggle"]' }).click();
		dr.findElement({ css: '.story .menu .confirmDelete' }).click();
		dr.wait(until.elementLocated({ css: '.modal.confirm.appear' }));
		var cancelButton = dr.findElement({ css: '.modal.confirm.appear button.cancel' });

		dr.wait(until.elementIsVisible(cancelButton)).then(function()
		{
			var confirmEl = dr.findElement({ css: '.modal.confirm.appear' });
			cancelButton.click();
			dr.wait(until.elementIsNotVisible(confirmEl));
			assert(dr.isElementPresent({ css: '.story h2' })).isTrue();
		});
	});

	test.it('Can delete a story', function()
	{
		createStory();
		dr.findElement({ css: '.story button[data-bubble="toggle"]' }).click();
		dr.findElement({ css: '.story .menu .confirmDelete' }).click();
		dr.wait(until.elementLocated({ css: '.modal.confirm.appear' }));
		var deleteButton = dr.findElement({ css: '.modal.confirm.appear button[data-action="yes"]' });

		dr.wait(until.elementIsVisible(deleteButton)).then(function()
		{
			var confirmEl = dr.findElement({ css: '.modal.confirm.appear' });
			deleteButton.click();
			dr.wait(until.elementIsNotVisible(confirmEl));

			var noStories = dr.findElement({ css: '.noStories' });
			dr.wait(until.elementIsVisible(noStories));
		});
	});

	test.it('Can generate an archive', function()
	{
		createStory();
		dr.findElement({ css: '.saveArchive' }).click();
	});
});
