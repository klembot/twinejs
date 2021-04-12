import classNames from 'classnames';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {
	DialogCard,
	DialogEditor
} from '../../../../components/container/dialog-card';
import {CodeArea} from '../../../../components/control/code-area';
import {usePrefsContext} from '../../../../store/prefs';
import {
	storyWithId,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';
import './story-javascript-dialog.css';

export interface StoryJavaScriptDialogProps {
	collapsed: boolean;
	onChangeCollapsed: (value: boolean) => void;
	onClose: () => void;
	storyId: string;
}

export const StoryJavaScriptDialog: React.FC<StoryJavaScriptDialogProps> = props => {
	const {collapsed, onChangeCollapsed, onClose, storyId} = props;
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	const className = classNames('story-javascript-dialog', {collapsed});
	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		updateStory(dispatch, stories, story, {script: text});
	};

	return (
		<div className={className}>
			<DialogCard
				collapsed={collapsed}
				headerLabel={t('storyJavaScript.title')}
				onChangeCollapsed={onChangeCollapsed}
				onClose={onClose}
			>
				<p>{t('storyJavaScript.explanation')}</p>
				<DialogEditor>
					<CodeArea
						fontFamily={prefs.javascriptEditorFontFamily}
						fontScale={prefs.javascriptEditorFontScale}
						onBeforeChange={handleChange}
						options={{autofocus: true, mode: 'js'}}
						value={story.script}
					/>
				</DialogEditor>
			</DialogCard>
		</div>
	);
};
