/**
 Manages the passage editor modal of a StoryEditView.

 @class StoryEditView.PassageEditor
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var CodeMirror = require('codemirror');
var Marionette = require('backbone.marionette');
var data = require('../../../data');
var locale = require('../../../locale');
var modal = require('../../../ui/modal');
var Passage = require('../../../data/passage');
var modalTemplate = require('./modal.ejs');
var tagTemplate = require('./tag.ejs');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
var prefixTrigger = require('../../../codemirror-ext/prefix-trigger');

// Harlowe compatibility
window.CodeMirror = CodeMirror;

module.exports = Marionette.ItemView.extend(
{
	/**
	 Opens a modal dialog for editing a passage.

	 @method open
	**/

	open: function (passage, story)
	{
		this.passage = passage;
		this.story = story;

		// remember previous window title

		this.prevTitle = document.title;
		document.title = locale.say('Editing \u201c%s\u201d', passage.get('name'));

		// open it

		this.setElement(modal.open(
		{
			classes: 'editor',
			content: Marionette.Renderer.render(modalTemplate, passage.attributes)
		}));

		this.setupCodeMirror();

		// warn the user about leaving before saving

		window.onbeforeunload = function()
		{
			return locale.say("Any changes to the passage you're editing haven't been saved yet. " +
			                  '(To do so, close the passage editor.)');
		};
	},

	setupCodeMirror: function()
	{
		prefixTrigger.initialize();

		/**
		 The instance of CodeMirror used for editing.

		 @property cm
		**/

		this.cm = CodeMirror.fromTextArea(this.$('.passageText')[0],
		{
			prefixTrigger:
			{
				prefixes: ['[[', '->'],
				callback: this.autocomplete.bind(this)
			},
			extraKeys:
			{
				'Ctrl-Space': this.autocomplete.bind(this)
			},
			indentWithTabs: true,
			lineWrapping: true,
			lineNumbers: false,
			mode: 'text'
		});

		// Load the story format, which may install a CodeMirror mode named after itself.
		// We use that mode if it is found to exist after loading.

		var storyFormat = data.storyFormatForStory(this.story);

		if (storyFormat)
			storyFormat.load(function (err)
			{
				var modeName = storyFormat.get('name').toLowerCase();

				if (! err && modeName in CodeMirror.modes)
				{
					/*
						This is a small hack to allow modes such as Harlowe to access the
						full text of the textarea, permitting its lexer to grow
						a syntax tree by itself.
					*/

					CodeMirror.modes[modeName].cm = this.cm;

					// Now that's done, we can assign the mode and trigger a re-render.

					this.cm.setOption('mode', modeName);
				}
			}.bind(this));

		// Set the mode to the default, 'text'. The above callback will reset it if it fires.

		this.cm.setOption('mode', 'text');
		var text = this.passage.get('text');

		// Reset the placeholder, which may have been modified by a prior story format.

		this.cm.setOption('placeholder', this.$('.passageText').attr('placeholder'));

		// swapDoc resets all of the attached events, undo history, etc. of the document.

		this.cm.swapDoc(CodeMirror.Doc(''));

		// These lines must be used (instead of passing the text to the above constructor)
		// to work around a bug in the CodeMirror placeholder code.

		this.cm.setValue(text || '');
		this.cm.clearHistory();

		// if the text is the default for a passage, select all of it
		// so the user can just start typing to replace it;
		// otherwise move the cursor to the end

		if (text == Passage.prototype.defaults.text)
			this.cm.execCommand('selectAll');
		else
			this.cm.execCommand('goDocEnd');

		// assemble a list of existing passage names for autocomplete

		this.cm.setOption('passageNames', data.passagesForStory(this.story).map(function (passage)
		{
			return passage.get('name');
		}));

		// actually show it
		// we refresh twice; now so the text will show properly
		// as the modal animates onscreen, later, once the animation
		// completes, so scrolling works properly

		this.cm.refresh();

		this.$el.one('modalOpen.twineui', function()
		{
			this.cm.refresh();
			this.cm.focus();
		}.bind(this));
	},

	/**
	 Shows an autocomplete menu for the current cursor, showing existing passage names.

	 @method autocomplete
	**/

	autocomplete: function()
	{
		this.cm.showHint({
			hint: function (cm)
			{
				var wordRange = cm.findWordAt(cm.getCursor());
				var word = cm.getRange(wordRange.anchor, wordRange.head).toLowerCase();

				var comps =
				{
					list: _.filter(cm.getOption('passageNames'), function (name)
					{
						return name.toLowerCase().indexOf(word) != -1;
					}),
					from: wordRange.anchor,
					to: wordRange.head
				};

				CodeMirror.on(comps, 'pick', function()
				{
					var doc = cm.getDoc();
					doc.replaceRange(']] ', doc.getCursor());
				});

				return comps;
			},
			completeSingle: false,
			extraKeys:
			{
				']': function (cm, hint)
				{
					var doc = cm.getDoc();
					doc.replaceRange(']', doc.getCursor());
					hint.close();
				},

				'-': function (cm, hint)
				{
					var doc = cm.getDoc();
					doc.replaceRange('-', doc.getCursor());
					hint.close();
				},

				'|': function (cm, hint)
				{
					var doc = cm.getDoc();
					doc.replaceRange('|', doc.getCursor());
					hint.close();
				}
			}
		});
	},

	/**
	 Closes the modal dialog for editing.

	 @method close
	**/

	close: function()
	{
		modal.close();
	},

	/**
	 Saves changes made by the user to the model, displaying any validation
	 errors.

	 @method save
	 @param {Event} e Event to stop
	 @return {Boolean} whether the save was successful
	**/

	save: function (e)
	{
		// gather current tag names

		var tags = [];

		this.$('.passageTags .tag').each(function()
		{
			tags.push($(this).attr('data-name'));
		});

		// try to save; we might error out if the passage name is a duplicate

		if (this.passage.save({
			name: this.$('.passageName').val(),
			text: this.cm.doc.getValue(),
			tags: tags
		}))
		{
			this.$('.error').addClass('hide');
			return true;
		}
		else
		{
			// show the error message

			var message = this.$('.error');
			message.removeClass('hide').text(this.passage.validationError);
			this.$('.passageName').focus();
			e.preventDefault();
			return false;
		};
	},

	/**
	 Shows the UI for adding a new tag.

	 @method showNewTag
	**/

	showNewTag: function()
	{
		this.$('.showNewTag').hide();
		this.$('.newTag').show();
		this.$('.newTagName').val('').focus();
	},

	/**
	 Hides the UI for adding a new tag.

	 @method showNewTag
	**/

	hideNewTag: function()
	{
		this.$('.showNewTag').show();
		this.$('.newTag').hide();
	},

	/**
	 Adds a new tag to the list. This does not affect the model
	 at all and thus has no validation associated with it.

	 @method addTag
	 @param {String} name name of the tag to add
	**/

	addTag: function (name)
	{
		this.tagContainer.append(this.tagTemplate({ name: name }));
	},

	/**
	 Restores the window title after finishing editing.

	 @method restoreTitle
	**/

	restoreTitle: function()
	{
		document.title = this.prevTitle;
		window.onbeforeunload = null;
	},

	events:
	{
		'modalClosing.twineui': 'save',
		'modalClose.twineui': 'restoreTitle'
	}
});
