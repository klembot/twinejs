import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {RouteToolbar} from '../../../components/route-toolbar';
import {AppActions} from '../../../route-actions';
import {StoryFormat} from '../../../store/story-formats';
import {FormatActions} from './formats/format-actions';
import {ViewActions} from './view-actions';

export interface StoryFormatListToolbarProps {
	selectedFormats: StoryFormat[];
}

export const StoryFormatListToolbar: React.FC<StoryFormatListToolbarProps> = props => {
	const {selectedFormats} = props;
	const {t} = useTranslation();

	return (
		<RouteToolbar
			tabs={{
				[t('common.storyFormat')]: (
					<FormatActions selectedFormats={selectedFormats} />
				),
				[t('common.view')]: <ViewActions />,
				[t('common.appName')]: <AppActions />
			}}
		/>
	);
};
