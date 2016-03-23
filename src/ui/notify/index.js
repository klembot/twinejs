const NotificationList = require('./list');
let notifications;

module.exports = function(html, className = '') {
	if (!notifications) {
		var container = document.createElement('div');
		document.querySelector('body').appendChild(container);
		notifications = new NotificationList({ el: container });
	}

	notifications.add(html, className);
};
