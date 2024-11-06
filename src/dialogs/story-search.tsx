import debounce from 'lodash/debounce';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconReplace} from '@tabler/icons';
import {DialogCard} from '../components/container/dialog-card';
import {CheckboxButton} from '../components/control/checkbox-button';
import {CodeArea} from '../components/control/code-area';
import {IconButton} from '../components/control/icon-button';
import {
	highlightPassages,
	passagesMatchingSearch,
	replaceInStory,
	storyWithId,
	StorySearchFlags
} from '../store/stories';
import {useUndoableStoriesContext} from '../store/undoable-stories';
import {DialogComponentProps} from './dialogs.types';
import './story-search.css';
import {usePrefsContext} from '../store/prefs';

// See https://github.com/codemirror/CodeMirror/issues/5444

const ignoreTab: any = {
	Tab: false,
	'Shift-Tab': false
};

// We put as much state as possible into props so that if the dialog switches
// position and is re-rendered as a new component, nothing is lost.

export interface StorySearchDialogProps extends DialogComponentProps {
	find: string;
	flags: StorySearchFlags;
	replace: string;
	storyId: string;
}

export const StorySearchDialog: React.FC<StorySearchDialogProps> = props => {
	const {find, flags, replace, storyId, onClose, onChangeProps, ...other} =
		props;
	const closingRef = React.useRef(false);
	const {prefs} = usePrefsContext();
	const {dispatch, stories} = useUndoableStoriesContext();
	const {t} = useTranslation();
	const story = storyWithId(stories, storyId);
	const matches = React.useMemo(
		() => passagesMatchingSearch(story.passages, find, flags).map(({id}) => id),
		[find, flags, story.passages]
	);
	const debouncedDispatch = React.useMemo(
		() => debounce(dispatch, 250, {leading: false, trailing: true}),
		[dispatch]
	);

	React.useEffect(() => {
		// If we are in the process of closing, don't dispatch any highlight
		// changes. We don't want to overwrite the dispatch that occurs in
		// handleClose.

		if (!closingRef.current) {
			debouncedDispatch(highlightPassages(story, matches));
		}

		// This doesn't return a cleanup function--cleanup occurs in handleClose
		// instead. This is safe because we know this effect will only ever change
		// highlight status of passages.
	}, [debouncedDispatch, matches, story]);

	function patchProps(props: Partial<StorySearchDialogProps>) {
		// Only patch relevant props--the management props will always be
		// overwritten.

		onChangeProps({
			storyId,
			find: props.find ?? find,
			flags: props.flags ?? flags,
			replace: props.replace ?? replace
		});
	}

	function handleClose() {
		closingRef.current = true;
		dispatch(highlightPassages(story, []));
		onClose();
	}

	function handleReplaceWithChange(text: string) {
		patchProps({replace: text});
	}

	function handleSearchForChange(text: string) {
		patchProps({find: text});
	}

	function handleReplace() {
		dispatch(
			replaceInStory(story, find, replace, flags),
			'undoChange.replaceAllText'
		);
	}

	function toggleFlag(name: keyof StorySearchFlags) {
		patchProps({flags: {...flags, [name]: !flags[name]}});
	}

	return (
		<DialogCard
			{...other}
			className="story-search-dialog"
			fixedSize
			headerLabel={t('dialogs.storySearch.title')}
			onClose={handleClose}
		>
			<div className="search-fields">
				<CodeArea
					id="story-search-dialog-find"
					label={t('dialogs.storySearch.find')}
					onChangeText={handleSearchForChange}
					options={{
						extraKeys: ignoreTab,
						mode: 'text'
					}}
					useCodeMirror={prefs.useCodeMirror}
					value={find}
				/>
				<CodeArea
					id="story-search-dialog-replace-with"
					label={t('dialogs.storySearch.replaceWith')}
					onChangeText={handleReplaceWithChange}
					options={{extraKeys: ignoreTab, mode: 'text'}}
					useCodeMirror={prefs.useCodeMirror}
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
