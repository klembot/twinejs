import * as React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../components/control/icon-button';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {
	passagesMatchingSearch,
	replaceInStory,
	storyWithId,
	useStoriesContext,
	StorySearchFlags
} from '../../store/stories';
import {SearchControls} from './search-controls';
import {SearchResults} from './search-results';

export const StorySearchRoute: React.FC = () => {
	const history = useHistory();
	const [flags, setFlags] = React.useState<StorySearchFlags>({
		includePassageNames: false,
		matchCase: false,
		useRegexes: false
	});
	const [replaceWith, setReplaceWith] = React.useState('');
	const [searchFor, setSearchFor] = React.useState('');
	const {dispatch, stories} = useStoriesContext();
	const {storyId} = useParams<{storyId: string}>();
	const story = storyWithId(stories, storyId);
	const matches = passagesMatchingSearch(story.passages, searchFor, flags);
	const {t} = useTranslation();

	function handleReplaceAll() {
		replaceInStory(dispatch, story, searchFor, replaceWith, flags);
	}

	return (
		<div className="story-search-route">
			<TopBar>
				<IconButton
					icon="arrow-left"
					label={story.name}
					onClick={() => history.push(`/stories/${story.id}`)}
					variant="primary"
				/>
				<IconButton
					disabled={matches.length === 0}
					icon="zap"
					label={t('storySearch.replaceAll')}
					onClick={handleReplaceAll}
					variant="danger"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('storySearch.title')}</h1>
				<SearchControls
					flags={flags}
					onChangeFlags={setFlags}
					onChangeReplaceWith={setReplaceWith}
					onChangeSearchFor={setSearchFor}
					replaceWith={replaceWith}
					searchFor={searchFor}
				/>
				<SearchResults
					flags={flags}
					replaceWith={replaceWith}
					results={matches}
					searchFor={searchFor}
					story={story}
				/>
			</MainContent>
		</div>
	);
};
