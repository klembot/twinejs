/*
Manages a queue for saving story files. We can't save story files immediately as
the user edits them, because the changes come so rapidly. Instead, we queue
saves up and periodically flush the queue.

You *must* call flush() on this module before the application closes to prevent
data loss.
*/

const StoryFile = require('./story-file');

let idQueue = [];
let flushTimeout;

const SaveQueue = module.exports = {
	/* How long to wait to flush the queue, in milliseconds. */

	delay: 10000,

	/*
	Attaches to a Vuex store, for retrieval of stories. Must be called before
	any flush() call.
	*/

	attachStore(store) {
		SaveQueue.store = store;
	},

	/*
	Queues an story to be saved. Repeated requests to save the same story don't
	change the queue, but they do reset the delay to save.
	*/

	queue(id) {
		if (flushTimeout) {
			window.clearTimeout(flushTimeout);
		}

		flushTimeout = window.setTimeout(SaveQueue.flush, SaveQueue.delay);

		if (idQueue.indexOf(id) === -1) {
			idQueue.push(id);
		}
	},

	/*
	Saves all pending stories.
	*/

	flush() {
		if (!SaveQueue.store) {
			throw new Error('No store has been set for this save queue');
		}

		while (idQueue.length > 0) {
			const id = idQueue.pop();
			const story = SaveQueue.store.state.story.stories.find(
				s => s.id === id
			);

			StoryFile.save(story, SaveQueue.store.state.appInfo);
		}
	}
};