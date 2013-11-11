var app = new Backbone.Marionette.Application({
	name: 'Twine',
	version: '2.0a',

	sync: function (callback)
	{
		var self = this;

		this.stories.fetch({
			success: function()
			{
				self.passages.fetch({
					success: function() { if (callback) callback() }
				});
			}
		});
	},

	publishStory: function (story)
	{
		RuntimeTemplate.publish(story, function (html)
		{
			var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
			saveAs(blob, story.get('name') + '.html');
		});
	},

	saveArchive: function()
	{
		var output = '';
		var stories = this.stories.toArray();
		var i = 0;

		function archiveStory()
		{
			// output, stories, and i are defined above
			
			stories[i].publish(function (html)
			{
				output += html + '\n\n';
				
				if (++i < stories.length)
					archiveStory();
				else
				{
					var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
					saveAs(blob, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
				}
			});
		};

		archiveStory();
	},

	importFile: function (data)
	{
		// parse data into a DOM

		var parsed = $('<html>');
		var count = 0;

		// remove surrounding <html>, if there is one

		if (data.indexOf('<html>') != -1)
			parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
		else
			parsed.html(data);

		parsed.find('[data-role="twinestory"]').each(function()
		{
			var $story = $(this);
			var startPassageId = $story.attr('data-startnode');

			// create a story object

			var story = window.app.stories.create({ name: $story.attr('data-name') });

			// and child passages

			$story.find('[data-role="passage"]').each(function()
			{
				var $passage = $(this);
				var posBits = $passage.attr('data-twine-position').split(',');

				passage = window.app.passages.create(
				{
					name: $passage.attr('data-name'),
					text: $passage.html(),
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				});	

				if ($passage.attr('data-id') == startPassageId)
					story.save({ startPassage: passage.id });
			});

			// for now, glom all style nodes into the stylesheet property

			var stylesheet = '';

			$story.find('[data-role="stylesheet"]').each(function()
			{
				stylesheet += $(this).text() + '\n';
			});

			// likewise for script nodes

			var script = '';

			$story.find('[data-role="script"]').each(function()
			{
				script += $(this).text() + '\n';
			});

			if (stylesheet != '' || script != '')
				story.save({ stylesheet: stylesheet, script: script });

			count++;
		});

		return count;
	}
});

app.addInitializer(function (options)
{
	app.stories = new StoryCollection();
	app.passages = new PassageCollection();
	app.sync();

	app.router = new TwineRouter();
	Backbone.history.start();
});

app.addRegions({
	mainRegion: '#regions .main'
});

window.app.start();
