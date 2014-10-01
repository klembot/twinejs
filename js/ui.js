'use strict';

window.uiInitBody = function()
{
	if (! $('body').data('uiInited'))
	{
		var $b = $('body');
		$b.data('uiInited', true);

		// modals only allow Escape keypresses out, which close the modal

		$b.on('keydown, keyup', '.modal', function (e)
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

		$b.on('webkitAnimationEnd oanimationend msAnimationEnd', function (e)
		{
			e.type = 'animationend';
			$(e.target).trigger(e);
		});

		// click handlers for showing and hiding modals

		$b.on('click', '[data-modal-show]', function (e)
		{
			$($(this).data('modal-show')).data('modal').trigger('show');
			e.preventDefault();
		});

		$b.on('click', '[data-modal-hide]', function (e)
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
				// hide any existing

				$('.active[data-bubble]').bubble('hide');

				// show this one

				$t.addClass('active');
				$bubble.css('display', 'block').addClass('fadeIn fast');
				$bubble.trigger('bubbleshow');
				break;

				case 'hide':
				// deactivate any toggle buttons

				$cont.find('button[data-bubble="toggle"]').removeClass('active');

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
				throw new Error("Don't know how to do bubble action " + action);
			};

			return this;
		};

		// click handler for showing and hiding bubbles

		$b.on('click', '.bubbleContainer [data-bubble]', function()
		{
			var $t = $(this);
			$t.bubble($t.data('bubble'));
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
				throw new Error("Don't know how to do collapse action " + action);
			};

			return this;
		};

		// click handler for showing and hiding collapsed elements

		$b.on('click', '.collapseContainer [data-collapse]', function()
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

		$b.on('click', '.tabs button', function() { $(this).tab(); });

		// set up notifications

		window.notify = function (message, className)
		{
			var notification = $(window.notify.template({ message: message, className: className }));
			$('#notifications').append(notification);

			if (className != 'danger')
				window.setTimeout(_.bind(function()
				{
					$(this).addClass('fadeOut')
					.one('animationend', function()
					{
						$(this).remove();
					});
				}, notification), 3000);
		};

		$b.on('click', '#notifications .close', function()
		{
			var notification = $(this).closest('div');
			notification.addClass('fadeOut');
			notification.one('animationend', function()
			{
				$(this).remove();
			});
		});

		window.notify.template = _.template('<div class="fadeIn <%= className %>">' +
											'<button class="close"><i class="fa fa-times"></i></button>' +
											'<%= message %></div>');
	};
};

$(document).ready(uiInitBody);

window.uiInitEl = function (el)
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
						els.modal.trigger('modalshow');
						return internalCallback(els);
					},

					afterShow: function (els, internalCallback)
					{
						els.modal.trigger('modalshown');
						_.defer(function() { window.uiInitEl(els.modal); });
						return internalCallback(els);
					},

					beforeHide: function (els, internalCallback)
					{
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
};
