/*
# mouse-scrolling

This exports functions to assist with scrolling the browser window when the
space bar is held down, a la Photoshop.
*/

'use strict';
var $ = require('jquery');

var scrollStart;

/*
Begins scrolling the document in response to mouse motion events.
*/

function startScrolling() {
	$('body').addClass('mouseScrolling');
	scrollStart = null;

	$(window)
		.on('mousemove.mouseScrolling', scroll)
		.on('keyup.mouseScrolling', function(e) {
			if (e.keyCode === 32) {
				stopScrolling();
				e.preventDefault();
			}
		});
}

/*
An event listener for mouse motion events, which actually makes the window
scroll.
*/

function scroll(e) {
	var $win = $(window);

	if (!scrollStart) {
		/*
		This is our first mouse motion event, so we need record the initial
		position of the mouse.
		*/

		scrollStart = {
			mouse: {x: e.pageX, y: e.pageY},
			window: {x: $win.scrollLeft(), y: $win.scrollTop()}
		};
	}
	else {
		$win.scrollLeft(scrollStart.window.x - (e.pageX - scrollStart.mouse.x));
		$win.scrollTop(scrollStart.window.y - (e.pageY - scrollStart.mouse.y));
	}
}

/*
Stops scrolling the window in response to mouse motion events.
*/

function stopScrolling() {
	$('body').removeClass('mouseScrolling');
	$(window).off('mousemove', scroll);
};

module.exports = {
	/*
	Attaches scrolling behavior to the window.
	
	@method attach
	@static
	*/
	attach: function() {
		$(window).on('keydown.mouseScrolling', function scrollListener(e) {
			if (e.keyCode === 32 && $('input:focus, textarea:focus').length === 0) {
				startScrolling();
				e.preventDefault();
			}
		});
	},

	/*
	Removes scrolling behavior from the window.

	@method detach
	@static
	*/
	detach: function() {
		$(window).off('.mouseScrolling');
	}
};
