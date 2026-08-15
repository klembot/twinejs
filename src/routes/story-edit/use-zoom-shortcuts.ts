import {useTranslation} from 'react-i18next';
import {useCommand} from '../../hotkeys';
import {Story, updateStory, useStoriesContext} from '../../store/stories';

const zoomLevels = [0.3, 0.6, 1];

/**
 * Registers the zoom commands for the story map. The keys they're bound to are
 * set in `src/hotkeys/default-keymap.ts`.
 */
export function useZoomShortcuts(story: Story) {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	function setZoom(zoom: number) {
		if (zoom !== story.zoom) {
			dispatch(updateStory(stories, story, {zoom}));
		}
	}

	function stepZoom(delta: number) {
		const index = zoomLevels.indexOf(story.zoom);

		// If the story is at a zoom level we don't know about, leave it alone.

		if (index === -1) {
			return;
		}

		setZoom(
			zoomLevels[Math.min(Math.max(index + delta, 0), zoomLevels.length - 1)]
		);
	}

	useCommand({
		id: 'view.zoomOut',
		label: t('hotkeys.commands.view.zoomOut'),
		run: () => stepZoom(-1),
		scope: 'story-map'
	});
	useCommand({
		id: 'view.zoomIn',
		label: t('hotkeys.commands.view.zoomIn'),
		run: () => stepZoom(1),
		scope: 'story-map'
	});
	useCommand({
		id: 'view.zoomReset',
		label: t('hotkeys.commands.view.zoomReset'),
		run: () => setZoom(1),
		scope: 'story-map'
	});
}
