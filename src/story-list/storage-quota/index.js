/*
# story-list/storage-quota

Exports a view which shows how much space the user has left in their browser's
local storage. 
*/

'use strict';
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var locale = require('../../locale');
var gaugeTemplate = require('./gauge.ejs');

module.exports = Backbone.View.extend({
	initialize: function(options) {
		this.parent = options.parent;
		this.render();
	},

	render: function() {
		this.$el.html(Marionette.Renderer.render(gaugeTemplate));

		var usedEl = this.$('.used');
		var percentEl = this.$('.percent');

		// Special case if we have no stories.

		if (this.parent.collection.length === 0) {
			usedEl.css('display', 'none');
			percentEl.text(locale.say('%d%% space available', 100));
			return;
		}

		/*
		Otherwise, we test the space in 100k chunks. When an allocation fails,
		we know we've found our space limit.
		*/

		var used = JSON.stringify(window.localStorage).length;
		var testString = new Array(102400).join('x');
		var free = 102400;
		var storageIndex = 0;

		var interval = window.setInterval(function() {
			var stop = false;

			try {
				window.localStorage.setItem(
					'__quotatest' + storageIndex,
					testString
				);
				free += 102400;
				storageIndex++;

				// Update the gauge as we go.

				var percent = Math.round(used / (used + free) * 100);

				percentEl.text(
					locale.say('%d%% space available', 100 - percent)
				);

				if (percent <= 1) {
					usedEl.css('width', '0.25em');
					percentEl.text(locale.say('%d%% space available', 99));
					stop = true;
				}
				else {
					usedEl.css('width', percent + '%');
				}
			}
			catch (e) {
				stop = true;
			}

			if (stop) {
				for (var i = 0; i <= storageIndex; i++) {
					window.localStorage.removeItem('__quotatest' + i);
				}

				window.clearInterval(interval);
			}
		}, 20);
	}
});
