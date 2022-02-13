import {debounce} from 'lodash';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
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
	const debouncedDispatch = React.useMemo(
		() => debounce(dispatch, 250),
		[dispatch]
	);
	const {t} = useTranslation();

	const story = storyWithId(stories, storyId);
	const matches = passagesMatchingSearch(story.passages, find, flags);

	React.useEffect(() => {
		debouncedDispatch(highlightPassagesMatchingSearch(story, find, flags));

		return () =>
			debouncedDispatch(highlightPassagesMatchingSearch(story, '', {}));
	}, [debouncedDispatch, find, flags, story]);

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
		<DialogCard
			{...other}
			className="story-search-dialog"
			fixedSize
			headerLabel={t('dialogs.storySearch.title')}
		>
			<div className="search-fields">
				<CodeArea
					label={t('dialogs.storySearch.find')}
					onBeforeChange={handleSearchForChange}
					options={{
						extraKeys: ignoreTab,
						mode: 'text'
					}}
					value={find}
				/>
				<CodeArea
					label={t('dialogs.storySearch.replaceWith')}
					onBeforeChange={handleReplaceWithChange}
					options={{extraKeys: ignoreTab, mode: 'text'}}
					value={replace}
				/>
			</div>
			<div className="search-flags">
				<CheckboxButton
					label={t('dialogs.storySearch.includePassageNames')}
					onChange={() => toggleFlag('includePassageNames')}
					value={flags.includePassageNames ?? false}
				/>
				<CheckboxButton
					label={t('dialogs.storySearch.matchCase')}
					onChange={() => toggleFlag('matchCase')}
					value={flags.matchCase ?? false}
				/>
				<CheckboxButton
					label={t('dialogs.storySearch.useRegexes')}
					onChange={() => toggleFlag('useRegexes')}
					value={flags.useRegexes ?? false}
				/>
			</div>
			<div className="search-results">
				<IconButton
					disabled={matches.length === 0}
					icon={<IconReplace />}
					label={t('dialogs.storySearch.replaceAll')}
					onClick={handleReplace}
					variant="danger"
				/>
				<span>
					{find &&
						(matches.length > 0
							? t('dialogs.storySearch.matchCount', {count: matches.length})
							: t('dialogs.storySearch.noMatches'))}
				</span>
			</div>
		</DialogCard>
	);
};
