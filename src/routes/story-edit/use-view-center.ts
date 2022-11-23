import * as React from 'react';
import {useDialogsContext} from '../../dialogs';
import {usePrefsContext} from '../../store/prefs';
import {Story} from '../../store/stories';
import {Point} from '../../util/geometry';

export function useViewCenter(story: Story, domElement: HTMLElement | null) {
	const {dialogs} = useDialogsContext();
	const {prefs} = usePrefsContext();

	const getCenter = React.useCallback(() => {
		if (!domElement) {
			throw new Error(
				'Asked for the center of an element, but it does not exist in the DOM yet'
			);
		}

		return {
			left: (domElement.scrollLeft + domElement.clientWidth / 2) / story.zoom,
			top: (domElement.scrollTop + domElement.clientHeight / 2) / story.zoom
		};
	}, [domElement, story.zoom]);

	const setCenter = React.useCallback(
		({left, top}: Point) => {
			if (!domElement) {
				throw new Error(
					'Asked to set the center of an element, but it does not exist in the DOM yet'
				);
			}

			const {height, width} = domElement.getBoundingClientRect();
			const scroll = {
				left: (left - width / story.zoom / 2) * story.zoom,
				top: (top - height / story.zoom / 2) * story.zoom
			};

			if (dialogs.length > 0) {
				scroll.left += prefs.dialogWidth / 2;
			}

			domElement.scrollTo(scroll);
		},
		[dialogs.length, domElement, prefs.dialogWidth, story.zoom]
	);

	return {getCenter, setCenter};
}
