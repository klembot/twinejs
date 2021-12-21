import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconPlus} from '@tabler/icons';
import {IconButton} from '../../../../components/control/icon-button';
import {usePrefsContext} from '../../../../store/prefs';
import {
	createUntitledStory,
	useStoriesContext
} from '../../../../store/stories';

export const CreateStoryButton: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const history = useHistory();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	function handleCreate() {
		const id = createUntitledStory(stories, prefs)(dispatch, () => stories);

		history.push(`/stories/${id}`);
	}

	return (
		<IconButton
			icon={<IconPlus />}
			label={t('common.new')}
			onClick={handleCreate}
		/>
	);
};
