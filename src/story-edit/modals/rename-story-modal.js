'use strict';
var Backbone = require('backbone');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
	},

	/**
	 Opens a modal dialog for search/replace.

	 @method open
	**/

	open() {
		this.$('.storyName').val(this.parent.model.get('name'));
		this.$('.noNameError').hide();
		this.$el.data('modal').trigger('show');
		this.$('.storyName').focus();
	},

	/**
	 Closes the modal dialog for search/replace.

	 @method close
	**/

	close() {
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Saves changes made by the user to the model, displaying any validation
	 errors. If this is passed an event, this stops the event's
	 propagation.

	 @method save
	**/

	save(e) {
		e.stopImmediatePropagation();
		var storyName = this.$('.storyName').val();

		if (storyName.trim() === '') {
			this.$('.noNameError').show().fadeIn();
			return;
		}

		this.parent.model.save({ name: this.$('.storyName').val() });
		this.close();
	},

	events: {
		'submit #renameStoryForm': 'save'
	}
});
