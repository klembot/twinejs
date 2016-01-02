'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var data = require('../../../data');
var locale = require('../../../locale');
var modal = require('../../../ui/modal');
var notify = require('../../../ui/notify');
var modalTemplate = require('./modal.ejs');
var itemTemplate = require('./item.ejs');

module.exports = Backbone.View.extend({
	/**
	    Opens a modal dialog for changing story formats.
	  **/

	open: function(story) {
		// Begin loading formats immediately

		this.story = story;
		this.formatsToLoad = data.storyFormats.clone();
		this.loadNextFormat();
		this.setElement(modal.open({
			content: Marionette.Renderer.render(modalTemplate, story.attributes)
		}));
	},

	/**
	    Changes the story's format.

	    @method changeFormat
	  **/

	changeFormat: function(name) {
		this.story.save({ storyFormat: name });
		this.$('button[data-format]').each(function() {
			var $t = $(this);

			if ($t.data('format') == name) {
				$t.addClass('active');
			}
			else {
				$t.removeClass('active');
			}
		});
	},

	/**
	    Incrementally loads information about each story format.
	    If there are more remaining to be loaded, then this calls itself
	    once the load is complete.
	  **/

	loadNextFormat: function() {
		if (this.formatsToLoad.length > 0) {
			var format = this.formatsToLoad.at(0);

			format.load(function(e) {
				if (e === undefined) {
					// Skip proofing-only formats

					if (! format.properties.proofing) {
						// Calculate containing directory for the format
						// so that image URLs, for example, are correct

						var path = format.get('url').replace(/\/[^\/]*?$/, '');

						format.properties.path = path;
						format.properties.active =
						(format.properties.name == this.story.get('storyFormat'));
						var content = $(
						Marionette.Renderer.render(itemTemplate, format.properties)
						);

						this.$('.formats').append(content);

						if (format.properties.name == this.story.get('storyFormat')) {
							content.find('button.select').addClass('active');
						}
					}
				}
				else {
					// L10n: %1$s is the name of the story format,
					// %2$s is the error message.
					notify(
					locale.say(
					'The story format &ldquo;%1$s&rdquo; could not be loaded (%2$s).',
					format.get('name'),
					e.message
					),
					'danger'
					);
				}

				this.formatsToLoad.remove(format);
				this.loadNextFormat();
			}.bind(this));
		}
		else {
			this.$('.loading').hide();
		}
	},

	events: {
		'click button[data-format]': function(e) {
			this.changeFormat($(e.target).closest('button').data('format'));
		}
	}
});
