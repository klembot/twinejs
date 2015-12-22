'use strict';
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Bubble = require('../../ui/bubble');
var menuTemplate = require('./menu.ejs');

module.exports = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.trigger = options.trigger;
		this.content = Marionette.Renderer.render(menuTemplate, options.parent.model.attributes);

		this.bubble = new Bubble(
		{
			parent: this.trigger[0],
			content: this.content,
			openOn: 'hover',
			position: 'bottom'
		});

		this.setElement(this.bubble.content());
	},

	events:
	{
		'click .delete': function (e)
		{
			this.parent.confirmDelete(e);
		},
		'click .edit': function()
		{
			this.parent.edit();
		},
		'click .test': function()
		{
			this.parent.test();
		},
		'click .setAsStart': function()
		{
			this.parent.setAsStart();
		}

	}
});
