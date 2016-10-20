// Handles importing HTML source code into story objects ready to be saved to
// the store. This works on both published story files and archives.
//
// The one difference between what's returned from this module and the usual
// objects in the store is that passages have a `pid` property instead of an
// `id`. Pids are sequential, not UUIDs.
//
// It's important that this code be as efficient as possible, as it directly
// affects startup time in the Twine desktop app. This module moves data from
// the filesystem into local storage, and the app can't begin until it's done.

// HTML selectors used to find data in HTML format.

const selectors =  {
	passage: 'tw-passage',
	story: 'tw-story',
	script: '[role=script]',
	stylesheet: '[role=stylesheet]',
	storyData: 'tw-storydata',
	passageData: 'tw-passagedata'
};

// Converts a DOM <tw-storydata> element to a story object matching the format
// in the store.

function domToObject(storyEl, forceLastUpdate) {
	return {
		// Important: this is the passage's pid (a one-off id created at
		// publish time), *not* a database id.

		startPassagePid:
			storyEl.attributes.startnode.value,
		name:
			storyEl.attributes.name.value,
		ifid:
			storyEl.attributes.ifid.value,
		lastUpdate:
			forceLastUpdate || new Date(),
		script:
			Array.from(storyEl.querySelectorAll(selectors.script))
				.reduce(
					(src, el) => src + `${el.textContent}\n`,
					''
				),
		stylesheet:
			Array.from(storyEl.querySelectorAll(selectors.stylesheet))
				.reduce(
					(src, el) => src + `${el.textContent}\n`,
					''
				),
		zoom:
			1,
		passages:
			Array.from(storyEl.querySelectorAll(selectors.passageData))
				.map(passageEl => {
					const pos = passageEl.attributes.position.value
						.split(',')
						.map(Math.floor);

					return {
						// Again, a one-off id, not a database id.

						pid:
							passageEl.attributes.pid.value,
						left:
							pos[0],
						top:
							pos[1],
						width:
							passageEl.attributes.width ?
								parseInt(passageEl.attributes.width.value)
								: 100,
						height:
							passageEl.attributes.height ?
								parseInt(passageEl.attributes.height.value)
								: 100,
						tags:
							passageEl.attributes.tags.value === '' ?
								[]
								: passageEl.attributes.tags.value.split(/\s+/),
						name:
							passageEl.attributes.name.value,
						text:
							passageEl.textContent
					};
				})
	};
}

module.exports = (html, lastUpdate) => {
	let nodes = document.createElement('div');

	nodes.innerHTML = html;

	return Array.from(
		nodes.querySelectorAll(selectors.storyData)
	)
	.map(storyEl => domToObject(storyEl, lastUpdate));
};
