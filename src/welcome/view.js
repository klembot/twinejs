/*
# welcome/view

Exports a view which shows the user a quick set of intro information, and then
records that it's been shown so that next time, it's skipped.
*/

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

	/*
	Saves that we've been viewed, and directs the user to the story list.

	@method finish
	*/
	finish: function() {
		this.welcomePref.save({ value: true });
		window.location.hash = '#stories';
	},

	/*
	Shows the next section of the view.

	@method next
	@param {Event} e triggering event
	*/
	next: function(e) {
		var $t = $(e.target);
		var next = $t.closest('div').next('div');

		// Fade out existing buttons.

		$t.closest('p')
			.addClass('fadeOut')
			.on('animationend', function() {
				$(this).remove();
			});

		// Show the next section.

		next
			.removeClass('hide')
			.addClass('slideDown');

		$('body').animate({ scrollTop: next.position().top + 100 });
	},

	events: {
		'click .next': 'next',
		'click .done': 'finish'
	}
});
