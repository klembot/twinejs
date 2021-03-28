import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {CodeArea} from '../../components/control/code-area';
import {StorySearchFlags} from '../../store/stories';
import './search-controls.css';

export interface SearchControlsProps {
	flags: StorySearchFlags;
	onChangeFlags: (value: StorySearchFlags) => void;
	onChangeReplaceWith: (value: string) => void;
	onChangeSearchFor: (value: string) => void;
	replaceWith: string;
	searchFor: string;
}

// See https://github.com/codemirror/CodeMirror/issues/5444

const ignoreTab: any = {
	Tab: false,
	'Shift-Tab': false
};

export const SearchControls: React.FC<SearchControlsProps> = props => {
	const {
		flags,
		onChangeFlags,
		onChangeReplaceWith,
		onChangeSearchFor,
		replaceWith,
		searchFor
	} = props;
	const {t} = useTranslation();

	const handleFlagChange = (name: keyof StorySearchFlags) => {
		onChangeFlags({...flags, [name]: !flags[name]});
	};

	const handleReplaceWithChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		onChangeReplaceWith(text);
	};

	const handleSearchForChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		onChangeSearchFor(text);
	};

	return (
		<div className="search-controls">
			<CheckboxButton
				label={t('storySearch.includePassageNames')}
				onChange={() => handleFlagChange('includePassageNames')}
				value={flags.includePassageNames ?? false}
			/>
			<CheckboxButton
				label={t('storySearch.matchCase')}
				onChange={() => handleFlagChange('matchCase')}
				value={flags.matchCase ?? false}
			/>
			<CheckboxButton
				label={t('storySearch.useRegexes')}
				onChange={() => handleFlagChange('useRegexes')}
				value={flags.useRegexes ?? false}
			/>
			<div className="search-controls-fields">
				<CodeArea
					label={t('storySearch.searchFor')}
					onBeforeChange={handleSearchForChange}
					options={{
						extraKeys: ignoreTab,
						mode: 'text'
					}}
					value={searchFor}
				/>
				<CodeArea
					label={t('storySearch.replaceWith')}
					onBeforeChange={handleReplaceWithChange}
					options={{extraKeys: ignoreTab, mode: 'text'}}
					value={replaceWith}
				/>
			</div>
		</div>
	);
};
