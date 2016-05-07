'use strict';
var assert = require('selenium-webdriver/testing/assert');
var firefox = require('selenium-webdriver/firefox');
var test = require('selenium-webdriver/testing');
var until = require('selenium-webdriver').until;

test.describe('WelcomeView', function() {
  var dr;
  var testUrl = 'file://' +
    __dirname.replace('/tests/selenium', '') +
    '/build/standalone/index.html';
  this.timeout(15000);

  test.beforeEach(function() {
    dr = new firefox.Driver();
    dr.get(testUrl + '#welcome');
  });

  test.afterEach(function() {
    dr.quit();
  });

  test.it('Is on the #welcome route', function() {
    assert(dr.isElementPresent({ css: 'div.hi h1' }));
  });

  test.it('Can be walked through', function() {
    var helpDiv = dr.findElement({ css: 'div.help' });
    var saveDiv = dr.findElement({ css: 'div.save' });
    var thanksDiv = dr.findElement({ css: 'div.thanks' });

    dr.findElement({ css: 'div.hi button' }).click();
    dr.wait(until.elementIsVisible(helpDiv));
    assert(dr.findElement({ css: 'div.help h1' }).getText())
      .equalTo('New here?');

    dr.findElement({ css: 'div.help button' }).click();
    dr.wait(until.elementIsVisible(saveDiv));
    assert(dr.findElement({ css: 'div.save h1' }).getText())
      .equalTo('Your work is saved only in your browser.');

    dr.findElement({ css: 'div.save button' }).click();
    dr.wait(until.elementIsVisible(thanksDiv));
    assert(dr.findElement({ css: 'div.thanks h1' }).getText())
      .equalTo('That\'s it!');

    dr.findElement({ css: 'div.thanks button' }).click();
    dr.wait(until.elementLocated({ css: '#storyListView h1' }));
  });
});
