'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var locale = require('../../locale');
var prompt = require('../../ui/modal/prompt');
var Bubble = require('../../ui/bubble');
var ScriptEditor = require('../editors/script');
var StatsModal = require('../modals/stats');
var StylesheetEditor = require('../editors/stylesheet');
var menuTemplate = require('./menu.ejs');

module.exports = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.trigger = options.trigger;
		this.content = Marionette.Renderer.render(menuTemplate);

		this.bubble = new Bubble(
		{
			parent: this.trigger[0],
			content: this.content,
			position: 'top'
		});

		this.setElement(this.bubble.content());
	},

	events:
	{
		'click .changeFormat': function()
		{
		},

		'click .editScript': function()
		{
			new ScriptEditor().open(this.parent.model);
		},

		'click .editStyle': function()
		{
			new StylesheetEditor().open(this.parent.model);
		},

		'click .renameStory': function()
		{
			prompt({
				prompt: locale.say("What should &ldquo;%s&rdquo; be renamed to?", this.parent.model.get('name')),
				defaultValue: this.parent.model.get('name'),
				confirmLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				callback: function (confirmed, text)
				{
					if (confirmed)
						this.parent.model.save({ name: text });
				}.bind(this)
			});
		},

		'click .snapToGrid': function()
		{
			this.parent.model.save({ snapToGrid: ! this.parent.model.get('snapToGrid') });
		},

		'click .storyStats': function()
		{
			new StatsModal().open(this.parent.model);
		},

		'click .proofStory': function()
		{
			this.parent.parent.proof();
		},

		'click .publishStory': function()
		{
			this.parent.parent.publish();
		}
	}
});
