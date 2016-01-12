/*
# ui/modal

Exports functions to open and close modal dialogs.
*/


'use strict';
var _ = require('underscore');
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var modalTemplate = require('./modal.ejs');

module.exports = {
	defaults: {
		classes: ''
	},

	/*
	Opens a modal dialog. If one is already open, then bad things will occur.

	@method open
	@param {Object} options Information about the modal. One property,
		`content`, is required, which is the HTML content to show in the modal.
		The other property supported is `classes`, a string of CSS classes to
		apply to the created modal.
	@return {DOMElement} the modal, now in the DOM
	@static
	*/

	open: function(options) {
		this.$modal = $(
			Marionette.Renderer.render(
				modalTemplate, _.defaults(options, this.defaults)
			)
		);
		this.$modal.on('click', '[data-modal="close"]', this.close.bind(this));

		// Block keyboard events.

		$(document).on(
			'keydown.twineui keypress.twineui keyup.twineui',
			function(e) {
				// Escape key closes the modal.

				if (e.type == 'keydown' && e.keyCode == 27) this.close();
				e.stopImmediatePropagation();
			}.bind(this)
		);

		// Add appearance animation and	`modalOpen`` event.

		this.$modal
			.addClass('fadeIn')
			.one('animationend', function() {
				this.$modal.trigger('modalOpen.twineui');
			}.bind(this))
			.find('#modal')
			.addClass('appear');

		// Trigger modalOpening event after execution stack completes.

		_.defer(function() {
			this.$modal.trigger('modalOpening.twineui');
		}.bind(this));

		$('body').addClass('modalOpen').append(this.$modal);
		return this.$modal;
	},

	/*
	Closes the open modal. If none is open, bad things happen.
	It is possible for event listeners on the modal to cancel this action by
	calling `preventDefault()` on the event this generates,
	`modalClosing.twineui`.

	@method close
	@static
	*/
	close: function() {
		// Trigger `modalClosing` event; bail if something canceled it.

		var closingEvent = $.Event('modalClosing.twineui');

		this.$modal.trigger(closingEvent);

		if (closingEvent.isDefaultPrevented()) {
			return;
		}

		// Animate it closing, then remove it from the DOM.

		this.$modal
			.removeClass('fadeIn')
			.addClass('fadeOut')
			.one('animationend', function() {
				this.$modal.trigger('modalClose.twineui').off('.twineui').remove();
				$('body').removeClass('modalOpen');
				$(document).off('.twineui');
			}.bind(this))
			.find('#modal')
				.removeClass('appear')
				.addClass('disappear');
	}
};
