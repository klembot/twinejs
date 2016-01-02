/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var data = require('../data');
var viewTemplate = require('./view.ejs');

module.exports = Marionette.ItemView.extend({
	template: viewTemplate,

	initialize: function() {
		this.welcomePref = data.pref('welcomeSeen');
	},

	onShow: function() {
		this.$('div:first-child').removeClass('hide').addClass('appear');
	},

	finish: function() {
		this.welcomePref.save({ value: true });
		window.location.hash = '#stories';
	},

	next: function(e) {
		var $t = $(e.target);
		var next = $t.closest('div').next('div');

		// Fade out existing buttons

		$t.closest('p').addClass('fadeOut')
    .on('animationend', function() {
	$(this).remove();
    });

		// Either show the next div, or move on to the story list
		// have to offset the position because we're animating it
		// downward, I think

		next.removeClass('hide').addClass('slideDown');
		$('body').animate({ scrollTop: next.position().top + 100 });
	},

	events: {
		'click .next': 'next',
		'click .done': 'finish'
	}
});
