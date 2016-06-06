// This replaces the template in the welcome module with one that is NW.js
// specific, i.e. doesn't mention anything about work being saved to the browser
// only.

module.exports = (WelcomeView) => {
	WelcomeView.options.template = require('./replacement-template.html');
};
