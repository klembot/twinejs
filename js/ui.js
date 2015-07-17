/**
 A collection of utility functions related to basic UI tasks such as
 modal dialogs and notifications.

 @class ui
 @static
**/

'use strict';
var _ = require('underscore');
var FastClick = require('fastclick');

global.jQuery = require('jquery');
require('jquery.powertip');
require('jquery.omniwindow');
var $ = global.jQuery;

var ui =
{
	/**
	 Performs one-time startup tasks.

	 @method initBody
	**/

	initBody: function()
	{
		if (! $('body').data('uiInited'))
		{
			var $b = $('body');
			$b.data('uiInited', true);

			/**
			 The FastClick instance used to cut input
			 deplays on mobile.
			 @property fastclick
			**/

			ui.fastclick = FastClick(document.body);

			// note iOS for some custom styles

			if (navigator.userAgent.match(/iPhone|iPad|iPod/i))
				$b.addClass('iOS');

			// note Safari for some functionality
			// Chrome includes Safari in its user agent

			if (navigator.userAgent.indexOf('Safari') != -1 &&
				navigator.userAgent.indexOf('Chrome') == -1)
				$b.addClass('safari');

			// modals only allow Escape keypresses out, which close the modal

			$b.on('keydown.twineui keyup.twineui', '.modal', function (e)
			{
				if (e.keyCode != 27)
					e.stopPropagation();
			});

			// create modal overlay element as needed
			// this blocks mouse events

			if ($('#modalOverlay').length == 0)
			{
				var overlay = $('<div id="modalOverlay" class="hide"></div>');
				overlay.on('mousedown, mouseup', function (e)
				{
					e.stopPropagation();
				});
				$b.append(overlay);
			};

			// set up notifications

			if ($('#notifications').length == 0)
				$b.append('<div id="notifications"></div>');

			// polyfill browser animation-related events

			$b.on('webkitAnimationEnd.twineui oanimationend.twineui msAnimationEnd.twineui', function (e)
			{
				e.type = 'animationend';
				$(e.target).trigger(e);
			});

			// click handlers for showing and hiding modals

			$b.on('click.twineui', '[data-modal-show]', function (e)
			{
				$($(this).data('modal-show')).data('modal').trigger('show');
				e.preventDefault();
			});

			$b.on('click.twineui', '[data-modal-hide]', function (e)
			{
				var modal = $(this).data('modal-hide');

				// special 'this' selector for hiding modals chooses
				// the closest up upward in the DOM tree

				if (modal == 'this')
					$(this).closest('.modal').data('modal').trigger('hide');
				else
					$(modal).data('modal').trigger('hide');
			});

			// function to do the actual work of showing/hiding bubbles
			// syntax is $(...).bubble('show' | 'hide' | 'toggle')

			$.fn.bubble = function (action)
			{
				var $t = $(this);
				var $cont = $t.closest('.bubbleContainer');
				var $bubble = $cont.find('.bubble');

				switch (action)
				{
					case 'show':
					// ignore repeated show calls

					if ($cont.hasClass('active'))
						return this;

					// hide any existing bubble and tooltips

					$('.active[data-bubble]').bubble('hide');
					$.powerTip.hide();

					// show this one

					$t.addClass('active');
					$cont.addClass('active');
					$bubble.css(
					{
						display: 'block',
						height: $bubble.height()
					}).addClass('fadeIn fast');
					$bubble.trigger('bubbleshow');
					break;

					case 'hide':
					// ignore repeated hide calls

					if (! $cont.hasClass('active'))
						return this;

					// deactivate any toggle buttons

					$cont.find('button[data-bubble="toggle"]').removeClass('active');
					$cont.removeClass('active');

					// hide the bubble

					$bubble.addClass('fadeOut fast').one('animationend', function()
					{
						$bubble.removeClass('fadeIn fadeOut').css('display', 'none');
					});
					$bubble.trigger('bubblehide');
					break;

					case 'toggle':
					if ($bubble.css('display') == 'block')
						$t.bubble('hide');
					else
						$t.bubble('show');
					break;

					default:
					// L10n: An internal error message related to UI components.
					throw new Error(window.app.say("Don't know how to do bubble action %s", action));
				};

				return this;
			};

			$b.on('click.twineui', function (e)
			{
				if ($(e.target).closest('.bubbleContainer').hasClass('active'))
					return;

				$('.active[data-bubble]').bubble('hide');
			});

			// click handler for showing and hiding bubbles

			$b.on('click.twineui', '.bubbleContainer [data-bubble]', function()
			{
				var $t = $(this);
				var bubbleAction = $t.data('bubble');
				$t.bubble(bubbleAction);

				if (bubbleAction == 'show' || bubbleAction == 'toggle')
					$.powerTip.hide();
			});

			// function to do the actual work of showing/hiding collapsible elements
			// syntax is $(...).collapse('show' | 'hide' | 'toggle')

			$.fn.collapse = function (action)
			{
				var $t = $(this);
				var $cont = $t.closest('.collapseContainer');

				switch (action)
				{
					case 'show':
					$cont.addClass('revealed').find('.collapse').slideDown();
					break;

					case 'hide':
					$cont.removeClass('revealed').find('.collapse').slideUp();
					break;

					case 'toggle':
					if ($cont.hasClass('revealed'))
						$t.collapse('hide');
					else
						$t.collapse('show');
					break;

					default:
					// L10n: An internal error message related to UI components.
					throw new Error(window.app.say("Don't know how to do collapse action %s", action));
				};

				return this;
			};

			// click handler for showing and hiding collapsed elements

			$b.on('click.twineui', '.collapseContainer [data-collapse]', function()
			{
				var $t = $(this);
				$t.collapse($t.data('collapse'));
			});

			// function to do the work of showing a tab
			// this must be called on the button triggering a tab

			$.fn.tab = function()
			{
				var $t = $(this);

				// update appearance

				$t.addClass('active');
				$t.closest('.tabs').find('button').not($t).removeClass('active');

				// show matching content

				$($t.data('content')).show().siblings().hide();

				return this;
			};

			// click handler for tabs

			$b.on('click.twineui', '.tabs button', function() { $(this).tab(); });

			// set up notifications

			$b.on('click.twineui', '#notifications .close', function()
			{
				var notification = $(this).closest('div');
				notification.addClass('fadeOut');
				notification.one('animationend', function()
				{
					$(this).remove();
				});
			});
		};
	},

	/**
	 Undoes all setup in initBody().

	 @method uninitBody
	**/

	uninitBody: function()
	{
		if ($('body').data('uiInited'))
		{
			// disable FastClick

			ui.fastclick.destroy();

			// remove DOM elements

			$('#modalOverlay, #notifications').remove();

			// remove classes and event handlers
			// and mark the body as uninited

			$('body').removeClass('iOS safari').off('.twineui').data('uiInited', null);
		};
	},

	/**
	 Performs startup tasks on a DOM element. This must be called on
	 any element that's dynamically added to the document. Note that
	 this defers execution until the current call stack clears so that
	 the DOM is completely ready.

	 @method initEl
	 @param {DOMElement} el
	**/

	initEl: function (el)
	{
		el = $(el);

		// we defer execution so that the DOM is ready to be inspected

		_.defer(function()
		{
			// activate tooltips

			el.find('button[title], a[title]').each(function()
			{
				$(this).powerTip({ placement: $(this).attr('data-tooltip-dir') || 's' });
			});

			// set up modals

			el.find('.modal').each(function()
			{
				var $t = $(this);

				if ($t.data('modal'))
					return;

				$t.data('modal', $t.omniWindow(
				{
					callbacks:
					{
						beforeShow: function (els, internalCallback)
						{
							$('body').addClass('modalOpen');
							els.modal.trigger('modalshow');

							// ugly hack to fix weirdo scrolling on iOS when the keyboard
							// comes up while editing a text field in a modal window
							// http://www.abeautifulsite.net/bootstrap-3-modals-and-the-ios-virtual-keyboard/

							if ($('body').hasClass('iOS'))
							{
								els.modal.css(
								{
									position: 'absolute',
									top: $(window).scrollTop() + 'px'
								});
							};

							return internalCallback(els);
						},

						afterShow: function (els, internalCallback)
						{
							els.modal.trigger('modalshown');
							_.defer(function() { ui.initEl(els.modal); });
							return internalCallback(els);
						},

						beforeHide: function (els, internalCallback)
						{
							// allow the modal to block this event via a callback

							if (els.modal.data('blockModalHide') &&
								els.modal.data('blockModalHide')() === true)
								return false;

							$('body').removeClass('modalOpen');
							els.modal.trigger('modalhide');
							return internalCallback(els);
						},

						afterHide: function (els, internalCallback)
						{
							els.modal.trigger('modalhidden');
							return internalCallback(els);
						}
					},

					overlay:
					{
						selector: '#modalOverlay',
						hideClass: 'hide',
						animations:
						{
							show: function (els, internalCallback)
							{
								els.overlay.addClass('fadeIn');	
								els.modal.addClass('appear');	
								internalCallback(els);
							},

							hide: function (els, internalCallback)
							{
								els.overlay.removeClass('fadeIn').addClass('fadeOut');	
								els.modal.removeClass('appear').addClass('fadeOut');	
								els.overlay.one('animationend', function()
								{
									els.overlay.removeClass('fadeOut');
									els.modal.removeClass('fadeOut').addClass('hide');
									internalCallback(els);
								});

							},
						}
					},

					modal:
					{
						hideClass: 'hide'
					}
				}));
			});

			// vertically center bubbles that are displayed to the side

			el.find('.bubble.left, .bubble.right').each(function()
			{
				$(this).css('margin-top', 0 - $(this).outerHeight() / 2);
			});

			// push bubbles pointing down above their sources

			el.find('.bubble.down').each(function()
			{
				$(this).css('top', 0 - $(this).outerHeight());
			});

			// activate the first tab and content area

			el.find('.tabs button').first().addClass('active');
			el.find('.tabContent > div:gt(0)').hide();
		});
	},

	/**
	 Shows a notification at the top of the browser window.

	 @method notify
	 @param {String} message HTML source of the message to display
	 @param {String} className CSS class to apply to the notification
	**/

	notify: function (message, className)
	{
		var notification = $(ui.notifyTemplate({ message: message, className: className }));
		$('#notifications').append(notification);

		if (className != 'danger')
			window.setTimeout(function()
			{
				$(this).addClass('fadeOut')
				.one('animationend', function()
				{
					$(this).remove();
				});
			}.bind(notification), 3000);
	},

	/**
	 The Underscore template used to display notifications.

	 @property notifyTemplate
	 @type string
	 @static
	**/

	notifyTemplate: _.template('<div class="fadeIn <%= className %>">' +
	                           '<button class="close"><i class="fa fa-times"></i></button>' +
	                           '<%= message %></div>'),

	/**
	 Shows a modal confirmation dialog, with one button (to continue the action)
	 and a Cancel button. 

	 @method confirm
	 @param {String} message HTML source of the message
	 @param {String} buttonLabel HTML label for the button
	 @param {Function} callback function to call if the user continues the button
	 @param {Object} options Object with optional parameters:
	                         modalClass (CSS class to apply to the modal),
							 buttonClass (CSS class to apply to the action button)
	**/

	confirm: function (message, buttonLabel, callback, options)
	{
		options = options || {};

		var modalContainer = $(ui.confirmTemplate(_.extend({
			message: message,
			buttonLabel: buttonLabel,
			modalClass: options.modalClass || '',
			buttonClass: options.buttonClass || ''
		}, window.app.templateProperties)));

		var modal = modalContainer.find('.modal');

		modal.on('click', 'button', function()
		{
			if ($(this).data('action') == 'yes' && callback)
				callback();

			modal.data('modal').trigger('hide');		
		});

		$('body').append(modalContainer);
		ui.initEl(modalContainer);

		// initEl defers execution, so we have to defer this too

		_.defer(function()
		{
			modal.data('modal').trigger('show');
		});
	},

	/**
	 The Underscore template used to display confirmation modals.

	 @property confirmTemplate
	 @type string
	 @static
	**/

	confirmTemplate: _.template('<div><div class="modal hide confirm <%- modalClass %>">' +
	                            '<div class="message"><%= message %></div><p class="buttons">' +
	                            '<button type="button" class="subtle cancel">' +
								'<i class="fa fa-times"></i> <%= s("Cancel") %></button> ' +
								'<button type="button" class="<%- buttonClass %>" data-action="yes">' +
								'<%= buttonLabel %></button></p></div></div>'),

	/**
	 Shows a modal dialog asking for the user to enter some text, with one
	 button (to continue the action) and a Cancel button. 

	 @method confirm
	 @param {String} message HTML source of the message
	 @param {String} buttonLabel HTML label for the button
	 @param {Function} callback function to call if the user continues the button;
	                            passed the entered value
	 @param {Object} options Object with optional parameters:
	                         defaultText (default text for the input),
	                         modalClass (CSS class to apply to the modal),
							 buttonClass (CSS class to apply to the action button)
	**/

	prompt: function (message, buttonLabel, callback, options)
	{
		options = options || {};
		options.defaultText = options.defaultText || '';

		var modalContainer = $(ui.promptTemplate(_.extend({
			message: message,
			defaultText: options.defaultText,
			buttonLabel: buttonLabel,
			modalClass: options.modalClass || '',
			buttonClass: options.buttonClass || ''
		}, window.app.templateProperties)));

		var modal = modalContainer.find('.modal');

		modal.on('click', 'button', function()
		{
			if ($(this).data('action') == 'yes' && callback)
				callback(modal.find('.prompt input[type="text"]').val());

			modal.data('modal').trigger('hide');	
		});

		modal.on('submit', 'form', function()
		{
			modal.find('button[data-action="yes"]').click();
		});

		$('body').append(modalContainer);
		ui.initEl(modalContainer);

		// initEl defers execution, so we have to defer this too

		_.defer(function()
		{
			modal.data('modal').trigger('show');
			modal.find('input[type="text"]').focus()[0].setSelectionRange(0, options.defaultText.length);
		});
	},

	/**
	 The Underscore template used to display prompt modals.

	 @property promptTemplate
	 @type string
	 @static
	**/

	promptTemplate: _.template('<div><div class="modal hide prompt <%- modalClass %>">' +
	                           '<form><div class="message"><%= message %></div>' +
							   '<p class="prompt"><input type="text" value="<%- defaultText %>" required></p>' +
							   '<p class="buttons">' +
							   '<button type="button" class="subtle cancel">' +
							   '<i class="fa fa-times"></i> <%= s("Cancel") %></button> ' +
							   '<button type="button" class="<%- buttonClass %>" data-action="yes">' +
							   '<%= buttonLabel %></button></p></form></div></div>'),
};

module.exports = ui;
