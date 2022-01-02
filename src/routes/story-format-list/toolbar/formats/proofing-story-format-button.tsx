import {IconEye} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {usePrefsContext} from '../../../../store/prefs';
import {StoryFormat} from '../../../../store/story-formats';

export interface ProofingStoryFormatButtonProps {
	format?: StoryFormat;
}

export const ProofingStoryFormatButton: React.FC<ProofingStoryFormatButtonProps> = props => {
	const {format} = props;
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const disabled =
		format?.loadState !== 'loaded' ||
		!format.properties.proofing ||
		(prefs.proofingFormat.name === format.name &&
			prefs.proofingFormat.version === format.version);
	const handleClick: React.MouseEventHandler = () => {
		if (!format) {
			throw new Error("Can't set undefined format as proofing");
		}

		dispatch({
			type: 'update',
			name: 'proofingFormat',
			value: {name: format.name, version: format.version}
		});
	};

	return (
		<IconButton
			disabled={disabled}
			icon={<IconEye />}
			label={t('routes.storyFormatList.toolbar.useAsProofingFormat')}
			onClick={handleClick}
		/>
	);
};
