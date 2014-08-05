
StoryListView.StorageQuota = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.render();
	},

	render: function()
	{
		var usedEl = this.$('.used');
		var percentEl = this.$('.percent');

		// special case: we have no stories

		if (this.parent.collection.length == 0)
		{
			usedEl.css('display', 'none');
			percentEl.text('100');
			return;
		};

		// otherwise, we test in 100k chunks 
		
		var used = JSON.stringify(window.localStorage).length;
		var testChunk = new Array(102400).join('x');
		var testString = testChunk;
		var free = 102400;

		var interval = window.setInterval(function()
		{
			var stop = false;

			try
			{
				window.localStorage.setItem('__test', testString);
				testString += testChunk;
				free += 102400;

				var percent = Math.round(used / (used + free) * 100);

				percentEl.text(100 - percent);

				if (percent <= 1)
				{
					usedEl.css('width', '0.25em');
					percentEl.text('99');
					stop = true;
				}
				else
					usedEl.css('width', percent + '%');
			}
			catch (e)
			{
				stop = true;
			};

			if (stop)
			{
				window.localStorage.removeItem('__test');
				window.clearInterval(interval);
			};
		}, 20);
	}
});
