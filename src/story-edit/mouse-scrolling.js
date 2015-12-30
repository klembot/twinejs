'use strict';
var $ = require('jquery');

var scrollStart;

/**
  Begins scrolling the document in response to mouse motion events.
**/

function startScrolling() {
  $('body').addClass('mouseScrolling');
  scrollStart = null;

  $(window).on('mousemove.mouseScrolling', scroll)
  .on('keyup.mouseScrolling', function(e) {
    if (e.keyCode === 32) {
      stopScrolling();
      e.preventDefault();
    }
  });
}

function scroll(e) {
  var $win = $(window);
  if (!scrollStart) {
    // This is our first mouse motion event, record position

    scrollStart = {
      mouse: { x: e.pageX, y: e.pageY },
      window: { x: $win.scrollLeft(), y: $win.scrollTop() },
    };
  } else {
    $win.scrollLeft(scrollStart.window.x - (e.pageX - scrollStart.mouse.x));
    $win.scrollTop(scrollStart.window.y - (e.pageY - scrollStart.mouse.y));
  }
}

/**
  Stops scrolling the document in response to mouse motion events.
**/

function stopScrolling() {
  $('body').removeClass('mouseScrolling');
  $(window).off('mousemove', scroll);
};

module.exports = {
  attach: function() {
    $(window).on('keydown.mouseScrolling', function scrollListener(e) {
      if (e.keyCode === 32 && $('input:focus, textarea:focus').length === 0) {
        startScrolling();
        e.preventDefault();
      }
    });
  },

  detach: function() {
    $(window).off('.mouseScrolling');
  },
};
