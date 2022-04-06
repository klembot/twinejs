import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconPlus} from '@tabler/icons';
import {usePrefsContext} from '../../../../store/prefs';
import {
	createStory,
	storyDefaults,
	useStoriesContext
} from '../../../../store/stories';
import {PromptButton} from '../../../../components/control/prompt-button';
import {unusedName} from '../../../../util/unused-name';

export const CreateStoryButton: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const [newName, setNewName] = React.useState(
		unusedName(
			storyDefaults().name,
			stories.map(story => story.name)
		)
	);
	const history = useHistory();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	function validateName(value: string) {
		if (value.trim() === '') {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.emptyName')
			};
		}

		if (
			stories.some(story => story.name.toLowerCase() === value.toLowerCase())
		) {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.nameConflict')
			};
		}

		return {valid: true};
	}

	function handleSubmit() {
		const id = createStory(stories, prefs, {name: newName})(
			dispatch,
			() => stories
		);

		history.push(`/stories/${id}`);
	}

	return (
		<PromptButton
			icon={<IconPlus />}
			label={t('common.new')}
			submitLabel={t('common.create')}
			submitVariant="create"
			onChange={e => setNewName(e.target.value)}
			onSubmit={handleSubmit}
			prompt={t('routes.storyList.toolbar.createStoryButton.prompt')}
			validate={validateName}
			value={newName}
		/>
	);
};
