import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {TopBar} from '../../../components/container/top-bar';
import {CheckboxButton} from '../../../components/control/checkbox-button';
import {IconButton} from '../../../components/control/icon-button';
import {
	Passage,
	Story,
	updateStory,
	useStoriesContext
} from '../../../store/stories';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {RenamePassageButton} from './rename-passage-button';

export interface PassageEditTopBarProps {
	passage: Passage;
	story: Story;
}

export const PassageEditTopBar: React.FC<PassageEditTopBarProps> = props => {
	const {passage, story} = props;
	const history = useHistory();
	const {testStory} = useStoryLaunch();
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	const isStart = story.startPassage === passage.id;

	function handleSetAsStart() {
		updateStory(dispatch, stories, story, {startPassage: passage.id});
	}

	function handleTestPassage() {
		testStory(story.id, passage.id);
	}

	return (
		<TopBar>
			<IconButton
				icon="arrow-left"
				label={story.name}
				onClick={() => history.push(`/stories/${story.id}`)}
				variant="primary"
			/>
			<IconButton
				icon="tool"
				label={t('passageEdit.testFromHere')}
				onClick={handleTestPassage}
			/>
			<RenamePassageButton passage={passage} story={story} />
			<CheckboxButton
				disabled={isStart}
				label={t('passageEdit.setAsStart')}
				onChange={handleSetAsStart}
				value={isStart}
			/>
		</TopBar>
	);
};
