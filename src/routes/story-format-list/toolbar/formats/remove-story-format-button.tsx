import {IconTrash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {usePrefsContext} from '../../../../store/prefs';
import {
	deleteFormat,
	StoryFormat,
	useStoryFormatsContext
} from '../../../../store/story-formats';

export interface RemoveStoryFormatButtonProps {
	format?: StoryFormat;
}

export const RemoveStoryFormatButton: React.FC<RemoveStoryFormatButtonProps> = props => {
	const {format} = props;
	const {dispatch} = useStoryFormatsContext();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	const isDefault =
		format?.name === prefs.storyFormat.name &&
		format?.version === prefs.storyFormat.version;
	const isProofing =
		format?.name === prefs.proofingFormat.name &&
		format?.version === prefs.proofingFormat.version;

	return (
		<IconButton
			disabled={!format || !format.userAdded || isDefault || isProofing}
			icon={<IconTrash />}
			label={t('common.remove')}
			onClick={() => format && dispatch(deleteFormat(format))}
		/>
	);
};
