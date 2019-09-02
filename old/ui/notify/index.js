import NotificationList from './list';
let notifications;

export default function notify(html, className = '') {
	if (!notifications) {
		let container = document.createElement('div');

		document.querySelector('body').appendChild(container);
		notifications = new NotificationList({el: container});
	}

	notifications.add(html, className);
}
