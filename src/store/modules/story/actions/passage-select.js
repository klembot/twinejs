import {intersects} from '@/util/rect';

export function deselectPassages({commit, getters}, {storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (p.selected) {
			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {selected: false}
			});
		}
	});
}

export function selectAllPassages({commit, getters}, {storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (!p.selected) {
			commit('updatePassage', {
				passageId: p.id,
				storyId,
				passageProps: {selected: true}
			});
		}
	});
}

export function selectPassage(
	{commit, getters},
	{exclusive, passageId, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	commit('updatePassage', {passageId, storyId, passageProps: {selected: true}});

	if (exclusive) {
		story.passages.forEach(p => {
			if (p.id !== passageId && p.selected) {
				commit('updatePassage', {
					passageId,
					storyId,
					passageProps: {selected: false}
				});
			}
		});
	}
}

export function selectPassagesInRect(
	{commit, getters},
	{height, ignore, left, storyId, top, width}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const selectRect = {height, left, top, width};

	story.passages.forEach(p => {
		if (ignore.find(r => r.id === p.id)) {
			/*
			We are ignoring this passage, e.g. this is an additive selection and
			it was already selected.
			*/
			return;
		}

		commit('updatePassage', {
			storyId,
			passageId: p.id,
			passageProps: {selected: intersects(selectRect, p)}
		});
	});
}
