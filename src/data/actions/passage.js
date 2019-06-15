const linkParser = require('../link-parser');
const rect = require('../../common/rect');

const actions = module.exports = {
	createPassage({ dispatch }, storyId, props) {
		dispatch('CREATE_PASSAGE_IN_STORY', storyId, props);
	},

	updatePassage({ dispatch }, storyId, passageId, props) {
		dispatch('UPDATE_PASSAGE_IN_STORY', storyId, passageId, props);
	},

	deletePassage({ dispatch }, storyId, passageId) {
		dispatch('DELETE_PASSAGE_IN_STORY', storyId, passageId);
	},

	selectPassages(store, storyId, filter) {
		const story = store.state.story.stories.find(
			story => story.id == storyId
		);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		story.passages.forEach(p => {
			const current = p.selected;
			const wantSelect = filter(p);

			/* Only dispatch updates where there are changes. */

			if (wantSelect !== current) {
				store.dispatch(
					'UPDATE_PASSAGE_IN_STORY',
					storyId,
					p.id,
					{ selected: wantSelect });
			}
		});
	},

	/*
	Moves a passage so it doesn't overlap any other in its story, and also
	snaps to a grid.
	*/

	positionPassage(store, storyId, passageId, gridSize, filter) {
		if (gridSize && typeof gridSize !== 'number') {
			throw new Error('Asked to snap to a non-numeric grid size: ' + gridSize);
		}

		const story = store.state.story.stories.find(
			story => story.id == storyId
		);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		const passage = story.passages.find(
			passage => passage.id == passageId
		);

		if (!passage) {
			throw new Error(
				`No passage exists in this story with id ${passageId}`
			);
		}

		const oldTop = passage.top;
		const oldLeft = passage.left;

		let passageRect = {
			top: passage.top,
			left: passage.left,
			width: passage.width,
			height: passage.height
		};

		/*
		Displacement in snapToGrid mode is set to 0 to prevent spaces
		being inserted between passages in a grid. Otherwise, overlapping
		passages are separated out with 10 pixels between them.
		*/

		const displacementDistance = (story.snapToGrid && gridSize) ?
			0
			: 10;

		/* Displace by other passages. */

		story.passages.forEach(other => {
			if (other === passage || (filter && !filter(other))) {
				return;
			}

			const otherRect = {
				top: other.top,
				left: other.left,
				width: other.width,
				height: other.height
			};

			if (rect.intersects(otherRect, passageRect)) {
				rect.displace(passageRect, otherRect, displacementDistance);
			}
		});

		/* Snap to the grid. */

		if (story.snapToGrid && gridSize && gridSize !== 0) {
			passageRect.left = Math.round(passageRect.left / gridSize) *
				gridSize;
			passageRect.top = Math.round(passageRect.top / gridSize) *
				gridSize;
		}

		/* Save the change if we actually changed anything. */

		if (passageRect.top !== oldTop || passageRect.left !== oldLeft) {
			actions.updatePassage(
				store,
				storyId,
				passageId,
				{
					top: passageRect.top,
					left: passageRect.left
				}
			);
		}
	},

	/*
	Adds new passages to a story based on new links added in a passage's text.
	*/

	createNewlyLinkedPassages(store, storyId, passageId, oldText, gridSize) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);
		const passage = story.passages.find(
			passage => passage.id === passageId
		);

		/* Determine how many passages we'll need to create. */

		const oldLinks = linkParser(oldText, true);
		const newLinks = linkParser(passage.text, true).filter(
			link => (oldLinks.indexOf(link) === -1) &&
				!(story.passages.some(passage => passage.name === link))
		);

		/* We center the new passages underneath this one. */

		const newTop = passage.top + 100 * 1.5;

		/*
		We account for the total width of the new passages as both the width of
		the passages themselves plus the spacing in between.
		*/

		const totalWidth = newLinks.length * 100 +
			((newLinks.length - 1) * (100 / 2));
		let newLeft = passage.left + (100 - totalWidth) / 2;

		newLinks.forEach(link => {
			store.dispatch(
				'CREATE_PASSAGE_IN_STORY',
				storyId,
				{
					name: link,
					left: newLeft,
					top: newTop
				}
			);

			const newPassage = story.passages.find(p => p.name === link);

			if (newPassage) {
				actions.positionPassage(
					store,
					storyId,
					newPassage.id,
					gridSize
				);
			}
			else {
				console.warn('Could not locate newly-created passage in order to position it');
			}

			newLeft += 100 * 1.5;
		});
	},

	/* Updates links to a passage in a story to a new name. */

	changeLinksInStory(store, storyId, oldName, newName) {
		// TODO: add hook for story formats to be more sophisticated

		const story = store.state.story.stories.find(
			story => story.id === storyId
		);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		/*
		Escape regular expression characters.
		Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
		*/

		const oldNameEscaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const newNameEscaped = newName.replace(/\$/g, '$$$$');

		const simpleLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const compoundLinkRe = new RegExp(
			'\\[\\[(.*?)(\\||->)' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const reverseLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(<-.*?)(\\]\\[.*?)?\\]\\]',
			'g'
		);

		story.passages.forEach(passage => {
			if (simpleLinkRe.test(passage.text) ||
				compoundLinkRe.test(passage.text) ||
				reverseLinkRe.test(passage.text)) {
				let newText = passage.text;

				newText = newText.replace(
					simpleLinkRe,
					'[[' + newNameEscaped + '$1]]'
				);
				newText = newText.replace(
					compoundLinkRe,
					'[[$1$2' + newNameEscaped + '$3]]'
				);
				newText = newText.replace(
					reverseLinkRe,
					'[[' + newNameEscaped + '$1$2]]'
				);

				store.dispatch(
					'UPDATE_PASSAGE_IN_STORY',
					storyId,
					passage.id,
					{ text: newText }
				);
			}
		});
	}
};