import {IconRocket} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	Passage,
	Story,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';

export interface StartAtPassageButtonProps {
	passage?: Passage;
	story: Story;
}

export const StartAtPassageButton: React.FC<StartAtPassageButtonProps> = props => {
	const {passage, story} = props;
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	function handleClick() {
		if (!passage) {
			throw new Error('No passage set');
		}

		dispatch(updateStory(stories, story, {startPassage: passage.id}));
	}

	return (
		<IconButton
			disabled={!passage || passage.id === story.startPassage}
			icon={<IconRocket />}
			label={t('routes.storyEdit.toolbar.startStoryHere')}
			onClick={handleClick}
		/>
	);
};
