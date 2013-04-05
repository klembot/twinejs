// Shows a single passage for editing.

PassageEditView = Backbone.Marionette.ItemView.extend({
	template: '#templates .passageEditView',

	events:
	{
		'click .close': function()
		{
			this.model.set({
				name: this.$('#passageName').val(),
				text: this.$('#passageText').val()
			});

			window.location.hash = window.location.hash.replace(/\/passages\/.*/, '');
		}
	}
});
