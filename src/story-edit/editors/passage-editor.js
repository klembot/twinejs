/**
 Manages the passage editor modal of a StoryEditView.

 @class StoryEditView.PassageEditor
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var CodeMirror = require('codemirror');
var locale = require('../../locale');
var Passage = require('../../data/models/passage');
var StoryFormat = require('../../data/models/story-format');
var tagTemplate = require('../ejs/passage-tag.ejs');

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror-ext/prefix-trigger');

// Harlowe compatibility
window.CodeMirror = CodeMirror;

module.exports = Backbone.View.extend({
	tagTemplate: tagTemplate,

	initialize(options) {
		/**
		 A reference to the DOM element containing all tags.

		 @property tagContainer
		**/

		this.tagContainer = this.$('.tags');

		/**
		 An Underscore template for rendering individual tags.

		 @property tagTemplate
		**/

		this.tagTemplate = this.tagTemplate;

		/**
		 The parent StoryEditView.

		 @property parent
		**/

		this.parent = options.parent;

		/**
		 The current story's object model.

		 @property story
		**/

		this.story = options.parent.model;

		/**
		 The instance of CodeMirror used for editing.

		 @property cm
		**/

		this.cm = CodeMirror.fromTextArea(this.$('.passageText')[0], {
			prefixTrigger: {
				prefixes: ['[[', '->'],
				callback: this.autocomplete.bind(this)
			},
			extraKeys: {
				'Ctrl-Space': this.autocomplete.bind(this)
			},
			indentWithTabs: true,
			lineWrapping: true,
			lineNumbers: false,
			mode: 'text'
		});

		this.$el
			.on('modalhide', this.restoreTitle.bind(this))
			.on('modalshown', function() {
				this.$el.one('animationend', function() {
					this.cm.refresh();
					this.cm.focus();
				}.bind(this));
			}.bind(this))
			.on('click', '.showNewTag', this.showNewTag.bind(this))
			.on('click', '.hideNewTag', this.hideNewTag.bind(this))
			.on('submit', function(e) {
				var name = this.$('.newTagName').val().replace(/\s/g, '-');

				// don't add duplicate tags

				if (this.model.get('tags').indexOf(name) == -1) {
					this.addTag(name);
				}

				this.hideNewTag();
				e.preventDefault();
			}.bind(this))
			.on('click', '.tag .remove', function() {
				$(this).closest('.tag').remove();
			})
			.data('blockModalHide', function() {
				var worked = this.save();

				if (worked) {
					window.onbeforeunload = null;
				}
				
				return !worked;
			}.bind(this));
	},

	/**
	 Opens a modal dialog for editing a passage.

	 @method open
	**/

	open() {
		// remember previous window title

		this.prevTitle = document.title;
		document.title = locale.say(
			'Editing \u201c%s\u201d', this.model.get('name')
		);

		// id and name

		this.$('.passageId').val(this.model.id);
		this.$('.passageName').val(this.model.get('name'));

		// Load the story format, which may install a CodeMirror mode named
		// after itself. We use that mode if it is found to exist after
		// loading.

		var storyFormatName = this.story.get('storyFormat');
		var storyFormat = StoryFormat.withName(storyFormatName);

		if (storyFormat) {
			storyFormat.load(function(err) {
				var modeName = storyFormatName.toLowerCase();
				
				if (!err && modeName in CodeMirror.modes) {
					// This is a small hack to allow modes such as Harlowe to
					// access the full text of the textarea, permitting its
					// lexer to grow a syntax tree by itself.

					CodeMirror.modes[modeName].cm = this.cm;

					// Now that's done, we can assign the mode and trigger a
					// re-render.

					this.cm.setOption('mode', modeName);
				}
			}.bind(this));
		}

		// Set the mode to the default, 'text'. The above callback will reset
		// it if it fires.

		this.cm.setOption('mode', 'text');
		var text = this.model.get('text');

		// Reset the placeholder, which may have been modified by a prior story
		// format.
		
		this.cm.setOption(
			'placeholder',
			this.$('.passageText').attr('placeholder')
		);

		// swapDoc resets all of the attached events, undo history, etc. of the
		// document.

		this.cm.swapDoc(CodeMirror.Doc(''));

		// These lines must be used (instead of passing the text to the above
		// constructor) to work around a bug in the CodeMirror placeholder
		// code.

		this.cm.setValue(text || '');
		this.cm.focus();
		this.cm.clearHistory();

		// if the text is the default for a passage, select all of it
		// so the user can just start typing to replace it;
		// otherwise move the cursor to the end

		if (text == Passage.prototype.defaults.text) {
			this.cm.execCommand('selectAll');
		}
		else {
			this.cm.execCommand('goDocEnd');
		}
		
		// sync tags

		this.tagContainer.empty();
		_.each(this.model.get('tags'), this.addTag, this);

		// assemble a list of existing passage names for autocomplete

		this.cm.setOption(
			'passageNames',
			_.map(this.parent.collection.models, model => model.get('name'))
		);

		// actually show it
		// we refresh twice; now so the text will show properly
		// as the modal animates onscreen, later, once the animation
		// completes, so scrolling works properly

		this.$el.data('modal').trigger('show');
		this.cm.refresh();

		// warn the user about leaving before saving

		window.onbeforeunload = () => locale.say(
            'Any changes to the passage you\'re editing haven\'t ' +
            'been saved yet. (To do so, close the passage editor.)');
	},

	/**
	 Shows an autocomplete menu for the current cursor, showing existing
	 passage names.

	 @method autocomplete
	**/

	autocomplete() {
		this.cm.showHint({
			hint(cm) {
				var wordRange = cm.findWordAt(cm.getCursor());
				var word = cm.getRange(
					wordRange.anchor,
					wordRange.head
				).toLowerCase();

				var comps = {
					list: _.filter(
						cm.getOption('passageNames'), name => name.toLowerCase().indexOf(word) != -1),

					from: wordRange.anchor,
					to: wordRange.head
				};

				CodeMirror.on(comps, 'pick', () => {
					var doc = cm.getDoc();

					doc.replaceRange(']] ', doc.getCursor());
				});

				return comps;
			},

			completeSingle: false,
			extraKeys: {
				']'(cm, hint) {
					var doc = cm.getDoc();

					doc.replaceRange(']', doc.getCursor());
					hint.close();
				},

				'-'(cm, hint) {
					var doc = cm.getDoc();

					doc.replaceRange('-', doc.getCursor());
					hint.close();
				},

				'|'(cm, hint) {
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

	close() {
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Saves changes made by the user to the model, displaying any validation
	 errors.

	 @method save
	 @param {Event} e Event to stop
	 @return {Boolean} whether the save was successful
	**/

	save() {
		// gather current tag names

		var tags = [];

		this.$('.passageTags .tag').each(function() {
			tags.push($(this).attr('data-name'));
		});

		// try to save; we might error out if the passage name is a duplicate

		if (this.model.save({
			name: this.$('.passageName').val(),
			text: this.cm.doc.getValue(),
			tags: tags
		})) {
			// have to manually set the style here because of jQuery .fadeIn()

			this.$('.error').addClass('hide').hide();
			this.$el.removeClass('hasError');
			return true;
		}

		// show the error message

		var message = this.$('.error');

		message
			.removeClass('hide')
			.text(this.model.validationError)
			.hide()
			.fadeIn();
		this.$el.addClass('hasError');
		this.$('.passageName').focus();
		return false;
	},

	/**
	 Shows the UI for adding a new tag.

	 @method showNewTag
	**/

	showNewTag() {
		this.$('.showNewTag').hide();
		this.$('.newTag').show();
		this.$('.newTagName').val('').focus();
	},

	/**
	 Hides the UI for adding a new tag.

	 @method showNewTag
	**/

	hideNewTag() {
		this.$('.showNewTag').show();
		this.$('.newTag').hide();
	},

	/**
	 Adds a new tag to the list. This does not affect the model
	 at all and thus has no validation associated with it.

	 @method addTag
	 @param {String} name name of the tag to add
	**/

	addTag(name) {
		this.tagContainer.append(this.tagTemplate({ name: name }));
	},

	/**
	 Restores the window title after finishing editing.

	 @method restoreTitle
	**/

	restoreTitle() {
		document.title = this.prevTitle;
	}
});
