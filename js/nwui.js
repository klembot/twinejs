
'use strict';

var nwui =
{
	active: 
	(typeof process !== "undefined" &&
	 typeof require !== "undefined" &&
	 typeof require('nw.gui') !== 'undefined'),

	init: function()
	{
		nwui.gui = require('nw.gui');

		// create Mac menus

		var win = nwui.gui.Window.get();
		var nativeMenuBar = new nwui.gui.Menu({ type: "menubar" });
		nativeMenuBar.createMacBuiltin(window.app.name);
		win.menu = nativeMenuBar;

		// open external links outside the app

		$('body').on('click', 'a', function (e)
		{
			var url = $(this).attr('href');

			if (url.match(/^https?:/))
			{
				nwui.gui.Shell.openExternal(url);
				e.preventDefault();
			};
		});
	}
};
