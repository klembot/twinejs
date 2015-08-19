'use strict';
var assert = require('selenium-webdriver/testing/assert');
var firefox = require('selenium-webdriver/firefox');
var test = require('selenium-webdriver/testing');
var until = require('selenium-webdriver').until;

test.describe('WelcomeView', function()
{
	var driver;
	var testUrl = 'file://' + __dirname.replace('/tests/selenium', '') + '/build/standalone/index.html';
	this.timeout(15000);

	test.beforeEach(function()
	{
		driver = new firefox.Driver();
		driver.get(testUrl + '#welcome');
	});

	test.afterEach(function()
	{
		driver.quit();
	});

	test.it('Is on the #welcome route', function()
	{
		assert(driver.isElementPresent({ css: 'div.hi h1' }));
	});

	test.it('Can be walked through', function()
	{
		var helpDiv = driver.findElement({ css: 'div.help' });
		var saveDiv = driver.findElement({ css: 'div.save' });
		var thanksDiv = driver.findElement({ css: 'div.thanks' });

		driver.findElement({ css: 'div.hi button' }).click();
		driver.wait(until.elementIsVisible(helpDiv));
		assert(driver.findElement({ css: 'div.help h1' }).getText())
		      .equalTo('New here?');
		
		driver.findElement({ css: 'div.help button' }).click();
		driver.wait(until.elementIsVisible(saveDiv));
		assert(driver.findElement({ css: 'div.save h1' }).getText())
		      .equalTo('Your work is saved only in your browser.');

		driver.findElement({ css: 'div.save button' }).click();
		driver.wait(until.elementIsVisible(thanksDiv));
		assert(driver.findElement({ css: 'div.thanks h1' }).getText())
		      .equalTo("That's it!");

		driver.findElement({ css: 'div.thanks button' }).click();
		driver.wait(until.elementLocated({ css: '#storyListView h1' }));
	});
});
