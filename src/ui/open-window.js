/*
Opens a new window/tab if a URL hasn't been opened already; if it has, it
instead reloads the existing window/tab.
*/

const windows = {};

module.exports = url => {
	if (windows[url]) {
		try {
			windows[url].focus();
			windows[url].location.reload();
			return;
		} catch (e) {
			/*
			Fall through: try opening the window as usual. The problem probably
			is that the window has since been closed by the user.
			*/
		}
	}

	windows[url] = window.open(url, url.replace(/\s/g, '_'));
};
