/**
 A plugin for showing bubbles, i.e. contextual popups that users can interact
 with. A bubble must have the class 'bubble'; it can also have 'up', 'down',
 'left', or 'right' to add an orientation for the bubble.

 A bubble must also be contained within an element classed 'bubbleContainer'.

 You can directly invoke this plugin on elements with either 'show', 'hide', or
 'toggle'.

 @module jquery-ext/bubble
**/

const $ = require('jquery');
const locale = require('../locale');

// syntax is $(...).bubble('show' | 'hide' | 'toggle')

$.fn.bubble = function(action) {
	const $t = $(this);
	const $cont = $t.closest('.bubbleContainer');
	const $bubble = $cont.find('.bubble');

	// vertically center bubbles that are displayed to the side,
	// push bubbles pointing down above their sources

	if ($bubble.hasClass('left') || $bubble.hasClass('right')) {
		$bubble.css('margin-top', 0 - $bubble.outerHeight() / 2);
	}
	else {
		if ($bubble.hasClass('down')) {
			$bubble.css('top', 0 - $bubble.outerHeight());
		}
	}

	switch (action) {
		case 'show':
			// ignore repeated show calls

			if ($cont.hasClass('active')) {
				return this;
			}

			// hide any existing bubble and tooltips

			$('.active[data-bubble]').bubble('hide');
			$.powerTip.hide();

			// show this one

			$t.addClass('active');
			$cont.addClass('active');
			$bubble.css({
				display: 'block',
				height: $bubble.height()
			}).addClass('fadeIn fast');
			$bubble.trigger('bubbleshow');
			break;

		case 'hide':
			// ignore repeated hide calls

			if (!$cont.hasClass('active')) {
				return this;
			}

			// deactivate any toggle buttons

			$cont.find('button[data-bubble="toggle"]').removeClass('active');
			$cont.removeClass('active');

			// hide the bubble

			$bubble.addClass('fadeOut fast').one('animationend', () => {
				$bubble.removeClass('fadeIn fadeOut').css('display', 'none');
			});

			$bubble.trigger('bubblehide');
			break;

		case 'toggle':
			if ($bubble.css('display') == 'block') {
				$t.bubble('hide');
			}
			else {
				$t.bubble('show');
			}

			break;

		default:
			// L10n: An internal error message related to UI components.
			throw new Error(
				locale.say('Don\'t know how to do bubble action %s', action)
			);
	};

	return this;
};
