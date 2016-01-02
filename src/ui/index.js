/**
  Provides some basic setup for UI elements.

  @module ui
**/

'use strict';
var $ = require('jquery');
var animEndEventString =
  'webkitAnimationEnd.twineui oanimationend.twineui msAnimationEnd.twineui';

module.exports = {
	/**
	    Performs one-time startup tasks, mainly setting up event listeners.
	    The heavy lifting is done in submodules or jQuery plugins living
	    in that module.
	  **/

	initialize: function() {
		var $b = $('body');

		if (! $b.data('uiAttached')) {
			var fastclick = require('fastclick');

			$b.data('uiAttached', true);

			/**
			        The FastClick instance used to cut input delays on mobile.
			        @property fastclick
			      **/

			// The API depends on whether we're using the CDN
			// or the CommonJS module :(

			if (fastclick.attach !== undefined) {
				this.fastclick = fastclick.attach(document.body);
			}
			else {
				this.fastclick = fastclick(document.body);
			}

			// Note iOS for some custom styles

			if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
				$b.addClass('iOS');
			}

			// Note Safari for some functionality
			// Chrome includes Safari in its user agent

			var hasSafari = navigator.userAgent.indexOf('Safari') !== -1;
			var hasNoChrome = navigator.userAgent.indexOf('Chrome') === -1;

			if (hasSafari && hasNoChrome) {
				$b.addClass('safari');
			}

			// Polyfill browser animation-related events

			$b.on(animEndEventString, function(e) {
				e.type = 'animationend';
				$(e.target).trigger(e);
			});
		}
	},

	/**
	    Undoes all setup in init().
	  **/

	destroy: function() {
		var $b = $('body');

		if ($b.data('uiInited')) {
			// Disable FastClick

			this.fastclick.destroy();

			// Remove classes and event handlers
			// and mark the body as uninited

			$b
			.removeClass('iOS safari')
			.off('.twineui')
			.data('uiInited', null);
		}
	},

	/**
	    Checks to see if the app is running a browser whose main UI is
	    touch-based. This doesn't necessarily mean that the browser doesn't
	    support touch at all, just that we expect the user to be interacting
	    through touchonly.

	    @return {Boolean} whether the browser is primarily touch-based
	  **/

	hasPrimaryTouchUI: function() {
		return /Android|iPod|iPad|iPhone|IEMobile/.test(window.navigator.userAgent);
	}
};
