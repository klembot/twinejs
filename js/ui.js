$(document).ready(function()
{
	// polyfill browser animation-related events

	$('body').on('webkitAnimationEnd oanimationend msAnimationEnd', function (e)
	{
		e.type = 'animationend';
		$(e.target).trigger(e);
	});

	// create modal overlay element

	$('body').append('<div id="modalOverlay" class="hide"></div>');

	// set up modals

	$('.modal').each(function()
	{
		var $t = $(this);
		$t.data('modal', $t.omniWindow(
		{
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

	// click handlers for showing and hiding modals

	$('body').on('click', '[data-modal-show]', function (e)
	{
		$($(this).attr('data-modal-show')).data('modal').trigger('show');

		e.preventDefault();
	});

	$('body').on('click', '[data-modal-hide]', function (e)
	{
		var modal = $(this).attr('data-modal-hide');

		// special 'this' selector for hiding modals chooses
		// the closest up upward in the DOM tree

		if (modal == 'this')
			$(this).closest('.modal').data('modal').trigger('hide');
		else
			$(modal).data('modal').trigger('hide');
	});

	// activate tooltips

	$('button[title], a[title]').each(function()
	{
		var $t = $(this);
		$t.powerTip({ placement: $t.attr('data-tooltip-dir') || 's' });
	});

	// vertically center bubbles that are displayed to the side

	$('.bubble.left, .bubble.right').each(function()
	{
		$(this).css('margin-top', 0 - $(this).outerHeight() / 2);
	});

	// click handlers for showing and hiding bubbles

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
			$bubble.css('display', 'block').addClass('fadeIn slideDownSmall');
			break;

			case 'hide':
			// deactivate any toggle buttons

			$cont.find('button[data-bubble="toggle"]').removeClass('active');

			// hide the bubble

			$bubble.addClass('fadeOut').one('animationend', function()
			{
				$bubble.removeClass('fadeIn fadeOut').css('display', 'none');
			});
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

	$('body').on('click', '.bubbleContainer [data-bubble]', function()
	{
		var $t = $(this);
		$t.bubble($t.attr('data-bubble'));
	});

	// set up notifications

	$('body').append('<div id="notifications"></div>');

	window.notify = function (message, className)
	{
		var notification = $('<div class="fadeIn ' + className + '">').html(message);
		$('#notifications').append(notification);

		window.setTimeout(function()
		{
			notification.addClass('fadeOut');
			notification.one('animationend', function()
			{
				$(this).remove();
			})
		}, 3000);
	};
});
