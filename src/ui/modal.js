'use strict';
var $ = window.jQuery = require('jquery');

require('../../lib/jquery/jquery.omniwindow.js');
var ui = require('./index');
var overlayTemplate = require('./ejs/modal-overlay.ejs');

// default modal options for OmniWindow

var modalOpts = {
	callbacks: {
		beforeShow(els, internalCallback) {
			$('body').addClass('modalOpen');
			els.modal.trigger('modalshow');

			// ugly hack to fix weirdo scrolling on iOS when the keyboard
			// comes up while editing a text field in a modal window
			// http://www.abeautifulsite.net/bootstrap-3-modals-and-the-ios-virtual-keyboard/

			if ($('body').hasClass('iOS')) {
				els.modal.css({
					position: 'absolute',
					top: $(window).scrollTop() + 'px'
				});
			}

			return internalCallback(els);
		},

		afterShow(els, internalCallback) {
			els.modal.trigger('modalshown');
			return internalCallback(els);
		},

		beforeHide(els, internalCallback) {
			// allow the modal to block this event via a callback

			if (els.modal.data('blockModalHide') &&
				els.modal.data('blockModalHide')() === true) {
				return false;
			}

			$('body').removeClass('modalOpen');
			els.modal.trigger('modalhide');
			return internalCallback(els);
		},

		afterHide(els, internalCallback) {
			els.modal.trigger('modalhidden');
			return internalCallback(els);
		}
	},

	overlay: {
		selector: '#modalOverlay',
		hideClass: 'hide',
		animations: {
			show(els, internalCallback) {
				els.overlay.addClass('fadeIn');
				els.modal.addClass('appear');
				internalCallback(els);
			},

			hide(els, internalCallback) {
				els.overlay.removeClass('fadeIn').addClass('fadeOut');
				els.modal.removeClass('appear').addClass('fadeOut');
				els.overlay.one('animationend', function() {
					els.overlay.removeClass('fadeOut');
					els.modal.removeClass('fadeOut').addClass('hide');
					internalCallback(els);
				});

			}
		}
	},

	modal: {
		hideClass: 'hide'
	}
};

$(ui).on('init', function initModal(e, options) {
	var $b = options.$body;

	// add modal overlay

	// create modal overlay element as needed
	// this blocks mouse events

	if ($('#modalOverlay').length === 0) {
		var overlay = $(overlayTemplate());

		overlay.on('mousedown mouseup', function(e) {
			e.stopPropagation();
		});

		$b.append(overlay);
	};

	// prevent keyboard events from leaking out of modals

	$b.on('keydown keyup', '.modal', function(e) {
		if (e.keyCode != 27) {
			e.stopPropagation();
		}
	});

	// click handlers for showing and hiding modals

	$b.on('click.twineui', '[data-modal-show]', function(e) {
		$($(this).data('modal-show')).data('modal').trigger('show');
		e.preventDefault();
	});

	$b.on('click.twineui', '[data-modal-hide]', function() {
		var modal = $(this).data('modal-hide');

		// special 'this' selector for hiding modals chooses
		// the closest up upward in the DOM tree

		if (modal == 'this') {
			$(this).closest('.modal').data('modal').trigger('hide');
		}
		else {
			$(modal).data('modal').trigger('hide');
		}
	});
})
.on('attach', function(e, options) {
	// set up modals

	options.$el.find('.modal').each(function() {
		var $t = $(this);

		if ($t.data('modal')) { return; }

		$t.data('modal', $t.omniWindow(modalOpts));
	});
})
.on('destroy', function() {
	$('#modalOverlay').remove();
});
