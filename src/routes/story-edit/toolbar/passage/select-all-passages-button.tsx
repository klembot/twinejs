import {IconMarquee} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {
	selectAllPassages,
	Story,
	useStoriesContext
} from '../../../../store/stories';

export interface SelectAllPassagesButtonProps {
	story: Story;
}

export const SelectAllPassagesButton: React.FC<SelectAllPassagesButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();
	const handleClick = React.useCallback(
		() => dispatch(selectAllPassages(story)),
		[dispatch, story]
	);

	useCommand({
		id: 'passage.selectAll',
		label: t('hotkeys.commands.passage.selectAll'),
		run: handleClick,
		scope: 'story-map'
	});

	return (
		<IconButton
			icon={<IconMarquee />}
			label={t('common.selectAll')}
			onClick={handleClick}
		/>
	);
};
