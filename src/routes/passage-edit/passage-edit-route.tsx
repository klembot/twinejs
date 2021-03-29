import * as React from 'react';
import {Prompt, useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {CodeArea} from '../../components/control/code-area';
import {FontSelect} from '../../components/control/font-select';
import {TagToolbar} from './tag-toolbar';
import {PassageEditTopBar} from './top-bar/top-bar';
import {setPref, usePrefsContext} from '../../store/prefs';
import {
	createNewlyLinkedPassages,
	passageWithId,
	storyWithId,
	updatePassage,
	useStoriesContext,
} from '../../store/stories';
import './passage-edit-route.css';

export const PassageEditRoute: React.FC = () => {
	const {passageId, storyId} = useParams<{
		passageId: string;
		storyId: string;
	}>();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const passage = passageWithId(stories, storyId, passageId);
	const [originalPassageText, setOriginalPassageText] = React.useState(
		passage.text
	);
	const [originalPassageId, setOriginalPassageId] = React.useState(passage.id);
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);

	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		updatePassage(
			storiesDispatch,
			story,
			passage,
			{text},
			{dontCreateNewlyLinkedPassages: true}
		);
	};

	// Add new links when navigating away.

	React.useEffect(() => {
		if (passage.id !== originalPassageId) {
			setOriginalPassageId(passage.id);
			setOriginalPassageText(passage.text);
		}
	}, [originalPassageId, passage.id, passage.text]);

	const handleLeave = () => {
		createNewlyLinkedPassages(
			storiesDispatch,
			story,
			passage,
			passage.text,
			originalPassageText
		);
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
					onChangeFamily={(value) =>
						setPref(prefsDispatch, 'passageEditorFontFamily', value)
					}
					onChangeScale={(value) =>
						setPref(prefsDispatch, 'passageEditorFontScale', value)
					}
				/>
				<CodeArea
					fontFamily={prefs.passageEditorFontFamily}
					fontScale={prefs.passageEditorFontScale}
					onBeforeChange={handleChange}
					options={{autofocus: true, mode: 'text'}}
					value={passage.text}
				/>
			</MainContent>
		</div>
	);
};
