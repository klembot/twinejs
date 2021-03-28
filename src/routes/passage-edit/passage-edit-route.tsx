import * as React from 'react';
import {Prompt, useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {CodeArea} from '../../components/control/code-area';
import {FontSelect} from '../../components/control/font-select';
import {TagToolbar} from './tag-toolbar';
import {PassageEditTopBar} from './top-bar/top-bar';
import {setPref, usePrefsContext} from '../../store/prefs';
import {
	passageWithId,
	storyWithId,
	updatePassage,
	useStoriesContext
} from '../../store/stories';
import './passage-edit-route.css';

export const PassageEditRoute: React.FC = () => {
	const {passageId, storyId} = useParams<{
		passageId: string;
		storyId: string;
	}>();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const passage = passageWithId(stories, storyId, passageId);
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);
	const [editedText, setEditedText] = React.useState(passage.text);

	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		setEditedText(text);
	};

	// TODO: this doesn't catch all instances (reload, go somewhere else entirely)
	// needs either a save button or moved to a modal. Maybe revisit
	// save-as-you-go... that's how editing tags and setting as start works.

	const handleLeave = () => {
		updatePassage(storiesDispatch, story, passage, {text: editedText});
		return true;
	};

	// TODO: weirdly doesn't show passage text when loading this route directly

	return (
		<div className="passage-edit-route">
			<Prompt message={handleLeave} />
			<PassageEditTopBar passage={passage} story={story} />
			<MainContent title={passage.name}>
				<TagToolbar passage={passage} story={story} />
				<FontSelect
					fontFamily={prefs.passageEditorFontFamily}
					fontScale={prefs.passageEditorFontScale}
					onChangeFamily={value =>
						setPref(prefsDispatch, 'passageEditorFontFamily', value)
					}
					onChangeScale={value =>
						setPref(prefsDispatch, 'passageEditorFontScale', value)
					}
				/>
				<CodeArea
					fontFamily={prefs.passageEditorFontFamily}
					fontScale={prefs.passageEditorFontScale}
					onBeforeChange={handleChange}
					options={{autofocus: true, mode: 'text'}}
					value={editedText}
				/>
			</MainContent>
		</div>
	);
};
