import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {Card} from '../../../components/container/card';
import {TopBar} from '../../../components/container/top-bar';
import {ControlledDropdownButton} from '../../../components/control/dropdown-button';
import {IconButton} from '../../../components/control/icon-button';
import {Story, useStoriesContext} from '../../../store/stories';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {Point} from '../../../util/geometry';
import {CreatePassageButton} from './create-passage-button';
import {HighlightField} from './highlight-field';
import {PublishToFileButton} from './publish-to-file-button';
import {RenameStoryButton} from './rename-story-button';
import {SelectAllPassagesButton} from './select-all-passages-button';
import {SetStoryFormatButton} from './set-story-format-button/set-story-format-button';
import {SnapToGridButton} from './snap-to-grid-button';
import {ZoomButtons} from './zoom-buttons';

export interface StoryEditTopBarProps {
	getCenter: () => Point;
	story: Story;
}

export const StoryEditTopBar: React.FC<StoryEditTopBarProps> = props => {
	const {getCenter, story} = props;
	const [menuOpen, setMenuOpen] = React.useState(false);
	const {playStory, proofStory, testStory} = useStoryLaunch();
	const {stories} = useStoriesContext();
	const history = useHistory();
	const {t} = useTranslation();

	function toggleMenu() {
		setMenuOpen(open => !open);
	}

	function runAndCloseMenu(callback: () => void) {
		callback();
		setMenuOpen(false);
	}

	return (
		<TopBar>
			<IconButton
				icon="arrow-left"
				label={t('storyList.title')}
				onClick={() => history.push('/')}
				variant="primary"
			/>
			<CreatePassageButton getCenter={getCenter} story={story} />
			<ZoomButtons story={story} />
			<IconButton
				icon="play"
				label={t('common.play')}
				onClick={() => runAndCloseMenu(() => playStory(story.id))}
			/>
			<IconButton
				icon="tool"
				label={t('common.test')}
				onClick={() => runAndCloseMenu(() => testStory(story.id))}
			/>
			<ControlledDropdownButton
				icon="more-horizontal"
				label={t('common.more')}
				onClick={toggleMenu}
				open={menuOpen}
			>
				<Card>
					<IconButton
						icon="search"
						label={t('storyEdit.topBar.findAndReplace')}
						onClick={() => history.push(`/stories/${story.id}/search`)}
					/>
					<SelectAllPassagesButton story={story} />
					<IconButton
						icon="bar-chart-2"
						label={t('storyEdit.topBar.storyStats')}
						onClick={() => history.push(`/stories/${story.id}/stats`)}
					/>
					<PublishToFileButton story={story} />
					<IconButton
						icon="book-open"
						label={t('storyEdit.topBar.proofStory')}
						onClick={() => runAndCloseMenu(() => proofStory(story.id))}
					/>
					<RenameStoryButton
						onCancelRename={() => setMenuOpen(false)}
						onRename={() => setMenuOpen(false)}
						story={story}
					/>
					<SnapToGridButton onChange={() => setMenuOpen(false)} story={story} />
					<SetStoryFormatButton
						onCancelChange={() => setMenuOpen(false)}
						story={story}
					/>
					<IconButton
						icon="code"
						label={t('storyEdit.topBar.editJavaScript')}
						onClick={() => history.push(`/stories/${story.id}/javascript`)}
					/>
					<IconButton
						icon="hash"
						label={t('storyEdit.topBar.editStylesheet')}
						onClick={() => history.push(`/stories/${story.id}/stylesheet`)}
					/>
				</Card>
			</ControlledDropdownButton>
			<HighlightField story={story} />
		</TopBar>
	);
};
