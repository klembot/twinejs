'use strict';
var assert = require('selenium-webdriver/testing/assert');
var firefox = require('selenium-webdriver/firefox');
var test = require('selenium-webdriver/testing');
var until = require('selenium-webdriver').until;

test.describe('StoryListView', function()
{
	var driver;
	var testUrl = 'file://' + __dirname.replace('/tests/selenium', '') + '/build/standalone/index.html';
	this.timeout(15000);

	test.beforeEach(function()
	{
		driver = new firefox.Driver();
		driver.get(testUrl + '#stories');
	});

	test.afterEach(function()
	{
		driver.quit();
	});

	test.it('Is on the #stories route', function()
	{
		assert(driver.isElementPresent({ css: '#regions #storyListView' }));
	});

	test.it('Shows initial message when no stories are saved', function()
	{
		var noStories = driver.findElement({ css: '.noStories' });
		assert(driver.findElement({ css: '.noStories' }).isDisplayed());
	});

	test.it('Can cancel out of adding a new story', function()
	{
		var addButton = driver.findElement({ css: '.addStory' });
		var bubble = addButton.findElement({ xpath: '../..' }).findElement({ css: '.bubble '});

		addButton.click();
		driver.wait(until.elementIsVisible(bubble));
		driver.findElement({ css: '.cancelAdd' }).click();
		driver.wait(until.elementIsNotVisible(bubble));
	});
});
