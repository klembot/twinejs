'use strict';
var _ = require('underscore');
var assert = require('selenium-webdriver/testing/assert');
var firefox = require('selenium-webdriver/firefox');
var key = require('selenium-webdriver').Key;
var phantomjs = require('selenium-webdriver/phantomjs');
var test = require('selenium-webdriver/testing');
var until = require('selenium-webdriver').until;
var helpers = require('./helpers');

test.describe('StoryEditView', function() {
  var dr;
  this.timeout(10000);

  test.beforeEach(function() {
    dr = new firefox.Driver();
    dr.manage().window().setSize(1024, 768);
    helpers.createStory(dr, true);
  });

  test.afterEach(function() {
    dr.quit();
  });

  function setCMText(dr, selector, text) {
    dr.executeScript('document.querySelector(\'' + selector +
    ' .CodeMirror\').CodeMirror.setValue(\'' +
    text + '\')');
  };

  function getCMText(dr, selector) {
    return dr.executeScript('return document.querySelector(\'' + selector +
    ' .CodeMirror\').CodeMirror.getValue()');
  };

  test.it('Displays the story title', function() {
    assert(dr.findElement({ css: 'button.storyName' }).getText())
      .equalTo(helpers.shortUni);
  });

  test.it('Returns to the story list with the home button', function() {
    dr.findElement({ css: 'a.home' }).click();
    dr.wait(until.elementLocated({ css: '#storyListView' }));
  });

  test.it('Creates a passage with the Create Passage button', function() {
    assert(
      dr.isElementPresent({ css: '.passages .passage:nth-of-type(2)' })
    ).isFalse();
    dr.findElement({ css: 'button.addPassage' }).click();
    assert(
      dr.isElementPresent({ css: '.passages .passage:nth-of-type(2)' })
    ).isTrue();
  });

  test.it('Edits a passage by double-clicking it', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));
  });

  test.it('Edits a passage by clicking its edit button', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .mouseMove(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.findElement({ css: '.passages .passage .edit' }).click();
    dr.wait(until.elementIsVisible(modal));
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));
  });

  test.it('Saves changes to passage text', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#passageEditModal', helpers.longUni);

    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.navigate().refresh();
    modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));

    assert(getCMText(dr, '#passageEditModal')).equalTo(helpers.longUni);
  });

  test.it('Adds passages that are newly linked', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#passageEditModal', '[[a new link]]');
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.wait(until.elementLocated({
      css: '.passages .passage:nth-of-type(2) .title',
    }));
    assert(
      dr.findElement({
        css: '.passages .passage:nth-of-type(2) .title',
      }).getText()
    ).equalTo('a new link');
  });

  test.it('Does not add passages for linked URLs', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#passageEditModal', 'http://twinery.org');
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.findElements({ css: '.passages .passage' }).then(function(els) {
      assert(els.length).equalTo(1);
    });
  });

  test.it('Updates links when passages are renamed', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#passageEditModal', '[[linked passage]]');
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.navigate().refresh();
    modal = dr.findElement({ css: '#passageEditModal' });

    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage:nth-of-type(2)' }))
      .perform();

    var passageName = dr.findElement({
      css: '#passageEditModal input.passageName',
    });
    passageName.clear();
    passageName.sendKeys('2 linked passage');
    dr.findElement({ css: '#passageEditModal .close' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    assert(
      dr.findElement({css: '.passages .passage:first-child .excerpt'}).getText()
    ).equalTo('[[2 linked passage]]');
  });

  test.it('Deletes a passage by clicking its delete button', function() {
    var passage = dr.findElement({ css: '.passages .passage' });

    dr.actions().mouseMove(passage).perform();
    dr.findElement({ css: '.passages .passage .delete' }).click();
    dr.wait(until.elementLocated({ css: '.modal.confirm' }));
    dr.findElement({ css: '.modal.confirm button.danger' }).click();
    dr.wait(until.stalenessOf(passage));
  });

  test.it('Immediately deletes a passage by clicking its delete button with the shift key held', function() {// jscs:ignore maximumLineLength
    var passage = dr.findElement({ css: '.passages .passage' });

    dr.actions().mouseMove(passage).sendKeys(key.SHIFT).perform();
    dr.findElement({ css: '.passages .passage .delete' }).click();
    dr.wait(until.stalenessOf(passage));
  });

  test.it('Changes zoom levels with the toolbar', function() {
    dr.findElement({ css: '.toolbar .zoomSmall' }).click();
    dr.wait(until.elementLocated({ css: '.main .zoom-small' }));
    dr.findElement({ css: '.toolbar .zoomMedium' }).click();
    dr.wait(until.elementLocated({ css: '.main .zoom-medium' }));
    dr.findElement({ css: '.toolbar .zoomBig' }).click();
    dr.wait(until.elementLocated({ css: '.main .zoom-big' }));
  });

  test.it('Tests a story with the Test button', function() {
    dr.findElement({ css: '.toolbar .testStory' }).click();
    dr.getAllWindowHandles(function(winds) {
      var found;

      for (var i = 0; i < winds.length; i++) {
        if (i == helpers.shortUni) {
          found = true;
        }
      }

      assert(found).isTrue();
    });
  });

  test.it('Plays a story with the Play button', function() {
    dr.findElement({ css: '.toolbar .playStory' }).click();
    dr.getAllWindowHandles(function(winds) {
      var found;

      for (var i = 0; i < winds.length; i++) {
        if (i == helpers.shortUni) {
          found = true;
        }
      }

      assert(found).isTrue();
    });
  });

  test.it('Renames a story via a dialog', function() {
    var modal = dr.findElement({ css: '#renameStoryModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.renameStory' }).click();
    dr.wait(until.elementIsVisible(modal));
    dr.findElement({ css: '#renameStoryModal input.storyName' }).clear();
    dr
      .findElement({ css: '#renameStoryModal input.storyName' })
      .sendKeys('This is different');
    dr.findElement({ css: '#renameStoryModal button[type="submit"]' }).click();
    dr.wait(until.elementIsNotVisible(modal));
    assert(dr.findElement({ css: '.storyNameVal' }).getText())
      .equalTo('This is different');
  });

  test.it('Creates a proofing version of the story via a menu item', function() { // jscs:ignore maximumLineLength
    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.proofStory' }).click();
    dr.getAllWindowHandles(function(winds) {
      var found;

      for (var i = 0; i < winds.length; i++) {
        if (i == helpers.shortUni) {
          found = true;
        }
      }

      assert(found).isTrue();
    });
  });

  test.it('Creates a published version of the story via a menu item', function() { // jscs:ignore maximumLineLength
    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.publishStory' }).click();
  });

  test.it('Saves changes to story script', function() {
    var modal = dr.findElement({ css: '#scriptEditModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.editScript' }).click();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#scriptEditModal', helpers.longUni);

    dr.findElement({ css: '#scriptEditModal button.save' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.navigate().refresh();
    modal = dr.findElement({ css: '#scriptEditModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.editScript' }).click();
    dr.wait(until.elementIsVisible(modal));

    assert(getCMText(dr, '#scriptEditModal')).equalTo(helpers.longUni);
  });

  test.it('Saves changes to story stylesheet', function() {
    var modal = dr.findElement({ css: '#stylesheetEditModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.editStyle' }).click();
    dr.wait(until.elementIsVisible(modal));
    setCMText(dr, '#stylesheetEditModal', helpers.longUni);

    dr.findElement({ css: '#stylesheetEditModal button.save' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.navigate().refresh();
    modal = dr.findElement({ css: '#stylesheetEditModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.editStyle' }).click();
    dr.wait(until.elementIsVisible(modal));

    assert(getCMText(dr, '#stylesheetEditModal')).equalTo(helpers.longUni);
  });

  test.it('Disables keyboard shortcuts when editing a passage', function() {
    var modal = dr.findElement({ css: '#scriptEditModal' });

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.editScript' }).click();
    dr.wait(until.elementIsVisible(modal));

    dr.findElement({ css: '#scriptEditModal' }).sendKeys(key.DELETE);
    dr.findElement({ css: '#scriptEditModal button.save' }).click();
    dr.wait(until.elementIsNotVisible(modal));

    dr.findElement({ css: '.passages .passage' });
  });

  test.it('Numbers new passages to avoid name conflicts', function() {
    dr.findElement({ css: '.toolbar .addPassage' }).click();
    dr.wait(
      until.elementLocated({ css: '.passages .passage:nth-of-type(2) .title' })
    );
    assert(
      dr.findElement({ css: '.passages .passage:nth-of-type(2) .title' })
        .getText()
    ).equalTo('Untitled Passage 1');
    dr.findElement({ css: '.toolbar .addPassage' }).click();
    dr.wait(
      until.elementLocated({ css: '.passages .passage:nth-of-type(3) .title' })
    );
    assert(
      dr.findElement({ css: '.passages .passage:nth-of-type(3) .title' })
        .getText()
    ).equalTo('Untitled Passage 2');
  });

  test.it('Warns a user before navigating away while editing a passage', function() {// jscs:ignore maximumLineLength
    var modal = dr.findElement({ css: '#passageEditModal' });

    assert(dr.executeScript('return window.onbeforeunload')).isNull();
    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    assert(dr.executeScript('return window.onbeforeunload')).not.isNull();
    dr.findElement({ css: '#passageEditModal button.close' }).click();
    assert(dr.executeScript('return window.onbeforeunload')).isNull();
  });

  test.it('Shows accurate story statistics', function() {
    var modal = dr.findElement({ css: '#passageEditModal' });

    assert(dr.executeScript('return window.onbeforeunload')).isNull();
    dr.actions()
      .doubleClick(dr.findElement({ css: '.passages .passage' }))
      .perform();
    dr.wait(until.elementIsVisible(modal));
    setCMText(
      dr,
      '#passageEditModal',
      '[[red]] [[green]] [[blue]] The quick brown fox jumps over the lazy dog.'
    );
    dr.findElement({ css: '#passageEditModal button.save' }).click();
    dr.wait(until.elementIsNotVisible(modal));
    dr.findElement({ css: 'body' }).sendKeys(key.END);
    dr.sleep(500); // Accommodate smooth scrolling

    var passage = dr.findElement({ css: '.passages .passage:nth-of-type(2)' });
    dr.actions().mouseMove(passage).sendKeys(key.SHIFT).perform();
    dr.findElement({
      css: '.passages .passage:nth-of-type(2) .delete',
    }).click();
    dr.wait(until.stalenessOf(passage));

    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.storyStats' }).click();

    modal = dr.findElement({ css: '#statsModal' });
    dr.wait(until.elementIsVisible(modal));
    assert(dr.findElement({ css: 'td.charCount' }).getText()).equalTo('145');
    assert(dr.findElement({ css: 'td.wordCount' }).getText()).equalTo('24');
    assert(dr.findElement({ css: 'td.passageCount' }).getText()).equalTo('3');
    assert(dr.findElement({ css: 'td.linkCount' }).getText()).equalTo('3');
    assert(
      dr.findElement({ css: 'td.brokenLinkCount' }).getText()
    ).equalTo('1');
  });

  test.it('Generates IFIDs that meet Treaty of Babel standards', function() {
    var modal = dr.findElement({ css: '#statsModal' });
    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.storyStats' }).click();
    dr.wait(until.elementIsVisible(modal));

    dr.findElement({ css: '.ifid' }).getText(function(ifid) {
      assert(ifid.length).greaterThan(7);
      assert(ifid.length).lessThan(64);
      assert(ifid).not.matches(/[^0-9A-Z\\-]/);
    });
  });

  test.it('Generates IFIDs that are stable', function() {
    var modal = dr.findElement({ css: '#statsModal' });
    dr.findElement({ css: 'button.storyName' }).click();
    dr.findElement({ css: 'button.storyStats' }).click();
    dr.wait(until.elementIsVisible(modal));

    dr.findElement({ css: '.ifid' }).getText(function(firstIfid) {
      dr.navigate().refresh();

      modal = dr.findElement({ css: '#statsModal' });
      dr.findElement({ css: 'button.storyName' }).click();
      dr.findElement({ css: 'button.storyStats' }).click();
      dr.wait(until.elementIsVisible(modal));

      assert(dr.findElement({ css: '.ifid' }).getText()).equalTo(firstIfid);
    });
  });
});
