import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IconReplace} from '@tabler/icons';
import {DialogCard} from '../components/container/dialog-card';
import {CheckboxButton} from '../components/control/checkbox-button';
import {CodeArea} from '../components/control/code-area';
import {IconButton} from '../components/control/icon-button';
import {
	highlightPassagesMatchingSearch,
	passagesMatchingSearch,
	replaceInStory,
	storyWithId,
	StorySearchFlags
} from '../store/stories';
import {useUndoableStoriesContext} from '../store/undoable-stories';
import {DialogComponentProps} from './dialogs.types';
import './story-search.css';

// See https://github.com/codemirror/CodeMirror/issues/5444

const ignoreTab: any = {
	Tab: false,
	'Shift-Tab': false
};

export interface StorySearchDialogProps extends DialogComponentProps {
	storyId: string;
}

export const StorySearchDialog: React.FC<StorySearchDialogProps> = props => {
	const {storyId, ...other} = props;
	const [flags, setFlags] = React.useState<StorySearchFlags>({
		includePassageNames: true,
		matchCase: false,
		useRegexes: false
	});
	const [replace, setReplace] = React.useState('');
	const [find, setFind] = React.useState('');
	const {dispatch, stories} = useUndoableStoriesContext();
	const {t} = useTranslation();

	const story = storyWithId(stories, storyId);
	const matches = passagesMatchingSearch(story.passages, find, flags);

	React.useEffect(() => {
		dispatch(highlightPassagesMatchingSearch(story, find, flags));

		return () => dispatch(highlightPassagesMatchingSearch(story, '', {}));
	}, [dispatch, find, flags, story]);

	const className = classNames('story-search-dialog', 'fixed-size', {
		collapsed: other.collapsed
	});

	function handleReplaceWithChange(
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) {
		setReplace(text);
	}

	function handleSearchForChange(
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) {
		setFind(text);
	}

	function handleReplace() {
		dispatch(
			replaceInStory(story, find, replace, flags),
			'undoChange.replaceAllText'
		);
	}

	function toggleFlag(name: keyof StorySearchFlags) {
		setFlags(flags => ({...flags, [name]: !flags[name]}));
	}

	return (
		<div className={className}>
			<DialogCard {...other} headerLabel={t('storySearch.title')}>
				<div className="search-fields">
					<CodeArea
						label={t('storySearch.find')}
						onBeforeChange={handleSearchForChange}
						options={{
							extraKeys: ignoreTab,
							mode: 'text'
						}}
						value={find}
					/>
					<CodeArea
						label={t('storySearch.replaceWith')}
						onBeforeChange={handleReplaceWithChange}
						options={{extraKeys: ignoreTab, mode: 'text'}}
						value={replace}
					/>
				</div>
				<div className="search-flags">
					<CheckboxButton
						label={t('storySearch.includePassageNames')}
						onChange={() => toggleFlag('includePassageNames')}
						value={flags.includePassageNames ?? false}
					/>
					<CheckboxButton
						label={t('storySearch.matchCase')}
						onChange={() => toggleFlag('matchCase')}
						value={flags.matchCase ?? false}
					/>
					<CheckboxButton
						label={t('storySearch.useRegexes')}
						onChange={() => toggleFlag('useRegexes')}
						value={flags.useRegexes ?? false}
					/>
				</div>
				<div className="search-results">
					<IconButton
						disabled={matches.length === 0}
						icon={<IconReplace />}
						label={t('storySearch.replaceAll')}
						onClick={handleReplace}
						variant="danger"
					/>
					<span>
						{find &&
							(matches.length > 0
								? t('storySearch.matchCount', {count: matches.length})
								: t('storySearch.noMatches'))}
					</span>
				</div>
			</DialogCard>
		</div>
	);
};
