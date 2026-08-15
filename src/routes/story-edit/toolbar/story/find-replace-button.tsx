import {IconSearch} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {StorySearchDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface FindReplaceButtonProps {
	story: Story;
}

export const FindReplaceButton: React.FC<FindReplaceButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	const handleClick = React.useCallback(
		() =>
			dispatch({
				type: 'addDialog',
				component: StorySearchDialog,
				props: {
					find: '',
					flags: {
						includePassageNames: true,
						matchCase: false,
						useRegexes: false
					},
					replace: '',
					storyId: story.id
				}
			}),
		[dispatch, story.id]
	);

	useCommand({
		id: 'story.findReplace',
		label: t('hotkeys.commands.story.findReplace'),
		run: handleClick,
		scope: 'story-map'
	});

	return (
		<IconButton
			icon={<IconSearch />}
			label={t('routes.storyEdit.toolbar.findAndReplace')}
			onClick={handleClick}
		/>
	);
};
