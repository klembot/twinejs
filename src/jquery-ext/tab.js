var $ = require('jquery');

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
