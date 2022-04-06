import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconTag} from '@tabler/icons';
import {MenuButton} from '../../../../components/control/menu-button';
import {usePrefsContext} from '../../../../store/prefs';

export interface TagFilterButtonProps {
	tags: string[];
}

export const TagFilterButton: React.FC<TagFilterButtonProps> = props => {
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	return (
		<MenuButton
			disabled={props.tags.length === 0}
			icon={<IconTag />}
			items={[
				{
					checkable: true,
					checked: prefs.storyListTagFilter.length === 0,
					label: t('routes.storyList.toolbar.showAllStories'),
					onClick: () =>
						dispatch({type: 'update', name: 'storyListTagFilter', value: []})
				},
				{separator: true},
				...props.tags.map(tag => ({
					checkable: true,
					checked: prefs.storyListTagFilter.includes(tag),
					label: tag,
					onClick: () =>
						dispatch({
							type: 'update',
							name: 'storyListTagFilter',
							value: prefs.storyListTagFilter.includes(tag)
								? prefs.storyListTagFilter.filter(t => t !== tag)
								: [...prefs.storyListTagFilter, tag]
						})
				}))
			]}
			label={t('routes.storyList.toolbar.showTags')}
		/>
	);
};
