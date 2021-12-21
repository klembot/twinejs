import {IconPuzzle} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {setPref, usePrefsContext} from '../../../../store/prefs';
import {StoryFormat} from '../../../../store/story-formats';

export interface StoryFormatExtensionsButtonProps {
	format?: StoryFormat;
}

export const StoryFormatExtensionsButton: React.FC<StoryFormatExtensionsButtonProps> = props => {
	const {format} = props;
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const extensionsDisabled = prefs.disabledStoryFormatEditorExtensions.some(
		other => other.name === format?.name && other.version === format?.version
	);

	function handleClick() {
		if (!format) {
			throw new Error('Format is not set');
		}

		// This logic is a little backwards--the user is setting whether to use the
		// extensions but our preferences track disabled ones.

		if (extensionsDisabled) {
			dispatch(
				setPref(
					'disabledStoryFormatEditorExtensions',
					prefs.disabledStoryFormatEditorExtensions.filter(
						f => f.name !== format.name || f.version !== format.version
					)
				)
			);
		} else {
			dispatch(
				setPref('disabledStoryFormatEditorExtensions', [
					...prefs.disabledStoryFormatEditorExtensions,
					{name: format.name, version: format.version}
				])
			);
		}
	}

	return (
		<IconButton
			disabled={!format}
			icon={<IconPuzzle />}
			label={t(
				`routes.storyFormatList.toolbar.${
					extensionsDisabled ? 'enable' : 'disable'
				}FormatExtensions`
			)}
			onClick={handleClick}
		/>
	);
};
