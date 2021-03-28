import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';
import {updateStory, Story, useStoriesContext} from '../../../store/stories';

export interface SnapToGridButtonProps {
	onChange?: (value: boolean) => void;
	story: Story;
}

export const SnapToGridButton: React.FC<SnapToGridButtonProps> = props => {
	const {onChange, story} = props;
	const {dispatch, stories} = useStoriesContext();
	const handleClick = React.useCallback(() => {
		updateStory(dispatch, stories, story, {snapToGrid: !story.snapToGrid});

		if (onChange) {
			onChange(!story.snapToGrid);
		}
	}, [dispatch, onChange, stories, story]);
	const {t} = useTranslation();

	return (
		<IconButton
			icon={story.snapToGrid ? 'check' : 'empty'}
			label={t('storyEdit.topBar.snapToGrid')}
			onClick={handleClick}
		/>
	);
};
