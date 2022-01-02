import {IconStar} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {usePrefsContext} from '../../../../store/prefs';
import {StoryFormat} from '../../../../store/story-formats';

export interface DefaultStoryFormatButtonProps {
	format?: StoryFormat;
}

export const DefaultStoryFormatButton: React.FC<DefaultStoryFormatButtonProps> = props => {
	const {format} = props;
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const disabled =
		format?.loadState !== 'loaded' ||
		format.properties.proofing ||
		(prefs.storyFormat.name === format.name &&
			prefs.storyFormat.version === format.version);
	const handleClick: React.MouseEventHandler = () => {
		if (!format) {
			throw new Error("Can't set undefined format as default");
		}

		dispatch({
			type: 'update',
			name: 'storyFormat',
			value: {name: format.name, version: format.version}
		});
	};

	return (
		<IconButton
			disabled={disabled}
			icon={<IconStar />}
			label={t('routes.storyFormatList.toolbar.useAsDefaultFormat')}
			onClick={handleClick}
		/>
	);
};
