/**
 The main Backbone app running the show. This is accessible via the
 global variable `window.app`.
 
 @module Twine
 @class TwineApp
 @extends Backbone.Marionette.Application
**/

'use strict';

var TwineApp = Backbone.Marionette.Application.extend(
{
	/**
	 Name of the app.

	 @property name
	**/

	name: 'Twine',

	/**
	 Version number of the app.

	 @property version
	**/

	version: '2.0.6',

	/**
	 Loads gettext strings via AJAX. This sets the app's i18nData and
	 locale properties.

	 @method loadLocale
	 @param {String} locale locale (e.g. en_us) to load
	 @param {Function} callback function to call once done
	**/

	loadLocale: function (locale, callback)
	{
		/**
		 The app's current locale.

		 @property locale
		 @readonly
		**/

		this.locale = locale;

		// set locale in MomentJS

		moment.locale(locale);

		if (locale != 'en-us' && locale != 'en')
		{
			$.ajax({
				url: 'locale/' + locale + '.js',
				dataType: 'jsonp',
				jsonpCallback: 'locale',
				crossDomain: true
			})
			.always(function (data)
			{
				/**
				 The raw JSON data used by the i18n object.

				 @property i18nData
				 @type {Object}
				 **/

				 this.i18nData = data;
				 callback();
			}.bind(this));
		}
		else
		{
			// dummy in data to get back source text as-is

			this.i18nData =
			{
				domain: 'messages',
				locale_data:
				{
					messages:
					{
						'':
						{
							domain: 'messages',
							lang: 'en-us',
							plural_forms: 'nplurals=2; plural=(n != 1);'
						}
					}
				}
			};
			callback();
		};
	},

	/**
	 Translates a string to the user-set locale, interpolating variables.
	 Anything passed beyond the source text will be interpolated into it.
	 Underscore templates receive access to this via the shorthand method s().

	 @method say
	 @param {String} source source text to translate
	 @return string translation
	**/

	say: function (source)
	{
		try
		{
			if (arguments.length == 1)
				return this.i18n.gettext(source);
			else
			{
				// interpolation required

				var sprintfArgs = [this.i18n.gettext(source)];

				for (var i = 1; i < arguments.length; i++)
					sprintfArgs.push(arguments[i]);

				return this.i18n.sprintf.apply(this.i18n.sprintf, sprintfArgs);
			};
		}
		catch (e)
		{
			// if all else fails, return English, even with ugly %d placeholders
			// so the user can see *something*

			return source;
		};
	},

	/**
	 Translates a string to the user-set locale, keeping in mind pluralization rules.
	 Any additional arguments passed after the ones listed here are interpolated into
	 the resulting string. Underscore template receive this as the shorthand method sp.

	 When interpolating, count will always be the first argument.
	
	 @method translatePlural
	 @param {String} sourceSingular source text to translate with singular form
	 @param {String} sourcePlural source text to translate with plural form
	 @param {Number} count count to use for pluralization
	 @return string translation
	**/
	
	sayPlural: function (sourceSingular, sourcePlural, count)
	{
		try
		{
			var sprintfArgs = [this.i18n.ngettext(sourceSingular, sourcePlural, count), count];

			for (var i = 3; i < arguments.length; i++)
				sprintfArgs.push(arguments[i]);
				
			return this.i18n.sprintf.apply(this.i18n.sprintf, sprintfArgs);
		}
		catch (e)
		{
			// if all else fails, return English, even with ugly placeholders
			// so the user can see *something*

			return sourcePlural.replace(/%d/g, count);
		};
	},

	/**
	 Saves data to a file. This appears to the user as if they had clicked
	 a link to a downloadable file in their browser. If no failure method is specified,
	 then this will show a notification when errors occur.

	 @method saveFile
	 @param {String} data data to save
	 @param {String} filename filename to save to
	 @param {Function} success callback function on a successful save, optional
	 @param {Function} failure callback function on a failed save (passed error), optional
	**/

	saveFile: function (data, filename, success, failure)
	{
		try
		{
			var $b = $('body');

			if (! $b.hasClass('iOS'))
			{
				// standard style

				var blob = new Blob([data], { type: 'text/html;charset=utf-8' });

				// Safari requires us to use saveAs in direct response
				// to a user event, so we punt and use a data: URI instead
				// we can't even open it in a new window as that seems to
				// trigger popup blocking

				if ($b.hasClass('safari'))
					window.location.href = URL.createObjectURL(blob);
				else
					saveAs(blob, filename);

				if (success)
					success();
			}
			else
			{
				// package it into a .zip; this will trigger iOS to try to
				// hand it off to Google Drive, Dropbox, and the like

				var zip = new JSZip();
				zip.file(filename, data);
				window.location.href = 'data:application/zip;base64, ' + zip.generate({ type: 'base64' });

				if (success)
					success();
			};
		}
		catch (e)
		{
			if (failure)
				failure(e);
			else
				// L10n: %1$s is a filename; %2$s is the error message.
				ui.notify(this.say('&ldquo;%1$s&rdquo; could not be saved (%2$s).', filename, e.message),
				          'danger');
		};
	},

	/**
	 Completely replaces the document with HTML source.

	 @method replaceContent
	 @param {String} html HTML source to replace, including DOCTYPE, <head>, and <body>.
	**/

	replaceContent: function (html)
	{
		// remove our ui hooks

		window.ui.uninitBody();

		// inject head and body separately -- otherwise DOM errors crop up

		$('head').html(html.substring(html.indexOf('<head>') + 6, html.indexOf('</head>')));
		$('body').html(html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>')));
	},

	/**
	 Publishes a story by binding it to a story format, either resulting in a downloadable
	 file or displaying it in the browser window.

	 @method publishStory
	 @param {Story} story Story model to publish.
	 @param {String} filename filename to save to; if null, displays the result in the browser
	 @param {Object} options options for publishing: format overrides the story's format with a
	                         StoryFormat object; formatOptions passes additional options to the format;
							 startPassageId overrides the story's start passage
	**/

	publishStory: function (story, filename, options)
	{
		options = options || {};
		var format;

		if (options.format)
			format = options.format;
		else
		{
			var formatName = options.format || story.get('storyFormat') ||
							 AppPref.withName('defaultFormat').get('value');

			format = StoryFormat.withName(formatName);
		};

		format.publish(story, options.formatOptions, options.startPassageId,
					   function (err, output)
		{
			if (err)
			{
				// L10n: %s is the error message.
				ui.notify(this.say('An error occurred while publishing your story. (%s)', err.message),
				          'danger');
			}
			else
			{
				if (filename)
					this.saveFile(output, filename);
				else
					this.replaceContent(output);
			};
		}.bind(this));
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		var output = '';

		StoryCollection.all().each(function (story)
		{
			// force publishing even if there is no start point set

			output += story.publish(null, null, true) + '\n\n';
		});

		this.saveFile(output, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' ' +
		              window.app.say('Twine Archive.html'));
	},
	
	/**
	 Imports a file containing either a single published story, or an
	 archive of several stories. The stories are immediately saved to storage.
	 This does not yet work with stories published by Twine 1.x.

	 @method importFile
	 @param {String} data Contents of the file to be imported.
	 @param {Date} lastUpdate If passed, overrides the last updated date of the stories.
	**/

	importFile: function (data, lastUpdate)
	{
		var selectors = this.selectors;

		// containers for the new stories and passages we will create
		var allStories = new StoryCollection();
		var allPassages = new PassageCollection();

		// parse data into a DOM

		var $parsed = $('<html>');
		var count = 0;

		// remove surrounding <html>, if there is one

		if (data.indexOf('<html>') != -1)
			$parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
		else
			$parsed.html(data);

		$parsed.find(selectors.storyData).each(function()
		{
			var $story = $(this);
			var startPassageId = $story.attr('startnode');

			// for now, glom all style nodes into the stylesheet property

			var stylesheet = '';

			$story.find(selectors.stylesheet).each(function()
			{
				stylesheet += $(this).text() + '\n';
			});

			// likewise for script nodes

			var script = '';

			$story.find(selectors.script).each(function()
			{
				script += $(this).text() + '\n';
			});

			// create a story object

			var story = allStories.create(
			{
				name: $story.attr('name'),
				storyFormat: $story.attr('format'),
				ifid: $story.attr('ifid'),
				stylesheet: (stylesheet != '') ? stylesheet : null,
				script: (script != '') ? script : null
			}, { wait: true });

			// and child passages
			
			$story.find(selectors.passageData).each(function()
			{
				var $passage = $(this);
				var id = $passage.attr('pid');
				var pos = $passage.attr('position');
				var posBits = pos.split(',');
				var tags = $passage.attr('tags').trim();
				tags = tags === "" ? [] : tags.split(/\s+/);

				var passage = allPassages.create(
				{
					name: $passage.attr('name'),
					tags: tags,
					text: $passage.text(),
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				}, { wait: true });	

				if (id == startPassageId)
					story.save({ startPassage: passage.id });
			});
			
			// override update date if requested
			
			if (lastUpdate)
				story.save({ lastUpdate: lastUpdate });

			count++;
		});

		return count;
	},

	/**
	 Checks for a newer version of the Twine app against
	 http://twinery.org/latestversion/2.json, using build numbers which
	 are automatically generated by Grunt.

	 If retrieving this information fails, then this does nothing.

	 @method checkForUpdate
	 @param {Number} latestBuildNumber build number to consider as current. This is
	                                   required; the app's build number is stored in
									   window.app.buildNumber.
	 @param {Function} callback if a new version is available, this is called with
	                            an object with the properties buildNumber, the newest
								release's build number, version, the human-readable
								version number, and url, the URL the download is available at.
	**/

	checkForUpdate: function (latestBuildNumber, callback)
	{
		$.getJSON('http://twinery.org/latestversion/2.json', function (data)
		{
			if (data.buildNumber > latestBuildNumber)
				callback(data);
		});
	},

	/**
	 Checks to see if the app is running a browser whose main UI is
	 touch-based. This doesn't necessarily mean that the browser doesn't
	 support touch at all, just that we expect the user to be interacting
	 through touchonly.

	 @method hasPrimaryTouchUI
	 @return {Boolean} whether the browser is primarily touch-based
	**/

	hasPrimaryTouchUI: function()
	{
		return /Android|iPod|iPad|iPhone|IEMobile/.test(window.navigator.userAgent);
	},

	/**
	 A static namespace of DOM selectors for Harlowe HTML elements.
	 This is aligned with utils/selectors.js in Harlowe.
	
	 @property selectors
	 @type Object
	 @final
	**/

	selectors: {
		passage: "tw-passage",
		story: "tw-story",
		script: "[role=script]",
		stylesheet: "[role=stylesheet]",
		storyData: "tw-storydata",
		passageData: "tw-passagedata"
	}
});

window.app = new TwineApp();

window.app.addInitializer(function ()
{
	/**
	 The Jed instance used to manage translations.
	 
	 @property i18n
	**/

	this.i18n = new Jed(this.i18nData);

	if (nwui.active)
		nwui.init();

	// add i18n hook to Marionette's rendering

	/**
	 Properties that are always passed to templates.
	 Right now, this is only used for 18n -- s() is a shorthand for TwineApp.say()
	 and sp() is a shorthand for TwineApp.sayPlural().

	 @property templateProperties
	**/

	this.templateProperties =
	{
		s: this.say.bind(this),
		sp: this.sayPlural.bind(this)
	};

	Backbone.Marionette.Renderer.render = function (template, data)
	{
		template = Marionette.TemplateCache.get(template);
		data = _.extend(data, window.app.templateProperties);

		if (typeof(template) == 'function')
			return template(data);	
		else
			return _.template(template)(data);
	};

	/**
	 Build number of the app.

	 @property buildNumber
	**/

	window.app.buildNumber = parseInt($('html').data('build-number'));

	/**
	 The app router.

	 @property router
	 @type TwineRouter
	**/

	window.app.router = new TwineRouter();
	Backbone.history.start();

	// create built-in story formats if they don't already exist

	var formats = StoryFormatCollection.all();

	if (! formats.findWhere({ name: 'Harlowe' }))
		formats.create({ name: 'Harlowe', url: 'storyformats/Harlowe/format.js', userAdded: false });

	if (! formats.findWhere({ name: 'Snowman' }))
		formats.create({ name: 'Snowman', url: 'storyformats/Snowman/format.js', userAdded: false });

	if (! formats.findWhere({ name: 'Paperthin' }))
		formats.create({ name: 'Paperthin', url: 'storyformats/Paperthin/format.js', userAdded: false });

	if (! formats.findWhere({ name: 'SugarCube' }))
		formats.create({ name: 'SugarCube', url: 'http://www.motoslave.net/sugarcube/1/twine2/format.js', userAdded: false });

	// set default formats if not already set
	// (second param is a default)

	AppPref.withName('defaultFormat', 'Harlowe');
	AppPref.withName('proofingFormat', 'Paperthin');
});

window.app.addRegions(
{
	/**
	 The top-level container for views.

	 @property mainRegion
	**/

	mainRegion:
	{
		selector: '#regions .main',
		regionClass: TransRegion
	}
});

// bootstrap app after loading localization, if any

(function()
{
	var locale;

	// URL parameter locale overrides everything

	var localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch)
		locale = localeUrlMatch[1];
	else
	{
		// use app preference; default to best guess
		// http://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser

		var localePref = AppPref.withName('locale',
		                                  window.navigator.userLanguage || window.navigator.language ||
		                                  window.navigator.browserLanguage || window.navigator.systemLanguage ||
		                                  'en-us');

		locale = localePref.get('value');
	};

	if (typeof locale == 'string')
        window.app.loadLocale(locale.toLowerCase(), function()
    	{
    		window.app.start();
    	});
    else
    {
        window.app.loadLocale('en', function()
    	{
    		window.app.start();
            _.defer(function()
            {
                // not localized because if we've reached this step,
                // localization isn't working
                ui.notify('Your locale preference has been reset to English due to a technical problem.<br>' +
                          'Please change it with the <b>Language</b> option in the story list.', 'danger');
            });
    	});
    };
})();
