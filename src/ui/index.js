/**
 Provides some basic setup for UI elements.

 @module ui
**/

'use strict';
var $ = require('jquery');
var fastclick = require('fastclick');

var ui = module.exports = {
	/**
	 Performs one-time startup tasks, mainly setting up event listeners.
	 The heavy lifting is done in submodules or jQuery plugins living
	 in that module.
	**/

	init() {
		if (!$('body').data('uiInited')) {
			var $b = $('body');

			$b.data('uiInited', true);

			/**
			 The FastClick instance used to cut input
			 deplays on mobile.
			 @property fastclick
			**/

			// the API depends on whether we're using the CDN
			// or the CommonJS module :(

			if (fastclick.attach !== undefined) {
				this.fastclick = fastclick.attach(document.body);
			}
			else {
				this.fastclick = fastclick(document.body);
			}

			// note iOS for some custom styles

			if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
				$b.addClass('iOS');
			}

			// note Safari for some functionality
			// Chrome includes Safari in its user agent

			if (navigator.userAgent.indexOf('Safari') != -1 &&
				navigator.userAgent.indexOf('Chrome') == -1) {
				$b.addClass('safari');
			}

			$b.on('webkitAnimationEnd.twineui oanimationend.twineui ' +
				'msAnimationEnd.twineui', e => {
				// polyfill browser animation-related events

				e.type = 'animationend';
				$(e.target).trigger(e);
			});

			$(ui).trigger('init', { $body: $b });

			window.app.mainRegion.on('show', () => {
				$(ui).trigger('attach', { $el: window.app.mainRegion.$el });
			});
		};
	},

	/**
	 Undoes all setup in init().
	**/

	destroy() {
		if ($('body').data('uiInited')) {
			// disable FastClick

			this.fastclick.destroy();

			$(ui).triggerHandler('destroy');

			// remove classes and event handlers
			// and mark the body as uninited

			$('body')
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

	hasPrimaryTouchUI() {
		return /Android|iPod|iPad|iPhone|IEMobile/.test(
			window.navigator.userAgent
		);
	}
};
