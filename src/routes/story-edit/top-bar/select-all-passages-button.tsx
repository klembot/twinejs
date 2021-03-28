import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';
import {
	selectAllPassages,
	Story,
	useStoriesContext
} from '../../../store/stories';

export interface SelectAllPassagesButtonProps {
	story: Story;
}

export const SelectAllPassagesButton: React.FC<SelectAllPassagesButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useStoriesContext();
	const handleClick = React.useCallback(() => {
		selectAllPassages(dispatch, story);
	}, [dispatch, story]);
	const {t} = useTranslation();

	return (
		<IconButton
			icon="layers"
			label={t('storyEdit.topBar.selectAllPassages')}
			onClick={handleClick}
		/>
	);
};
