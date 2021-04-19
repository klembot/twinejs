import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';
import {
	createUntitledPassage,
	Story,
	useStoriesContext
} from '../../../store/stories';
import {Point} from '../../../util/geometry';

export interface CreatePassageButtonProps {
	getCenter: () => Point;
	story: Story;
}

export const CreatePassageButton: React.FC<CreatePassageButtonProps> = props => {
	const {getCenter, story} = props;
	const {dispatch} = useStoriesContext();
	const handleClick = React.useCallback(() => {
		const {left, top} = getCenter();

		dispatch(createUntitledPassage(story, left, top));
	}, [dispatch, getCenter, story]);
	const {t} = useTranslation();

	return (
		<IconButton
			icon="plus"
			label={t('storyEdit.topBar.addPassage')}
			onClick={handleClick}
			variant="create"
		/>
	);
};
