import * as React from 'react';
import {usePrefsContext} from './prefs';
import {useStoriesContext} from './stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from './story-formats';
import {usePersistence} from './persistence/use-persistence';
import {LoadingCurtain} from '../components/loading-curtain';

export const StateLoader: React.FC = ({children}) => {
	const [inited, setInited] = React.useState(false);
	const [repaired, setRepaired] = React.useState(false);
	const {dispatch: prefsDispatch, prefs: prefsState} = usePrefsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {
		dispatch: formatsDispatch,
		formats: formatsState
	} = useStoryFormatsContext();
	const {prefs, stories, storyFormats} = usePersistence();

	// Done in two steps so that the repair action can see the inited state.

	React.useEffect(() => {
		if (!inited) {
			formatsDispatch({type: 'init', state: storyFormats.load()});
			prefsDispatch({type: 'init', state: prefs.load()});
			storiesDispatch({type: 'init', state: stories.load()});
			setInited(true);
		}
	}, [
		formatsDispatch,
		inited,
		prefs,
		prefsDispatch,
		stories,
		storiesDispatch,
		storyFormats
	]);

	React.useEffect(() => {
		if (!repaired) {
			prefsDispatch({type: 'repair'});
			formatsDispatch({type: 'repair'});
			storiesDispatch({
				type: 'repair',
				allFormats: formatsState,
				defaultFormat: formatWithNameAndVersion(
					formatsState,
					prefsState.storyFormat.name,
					prefsState.storyFormat.version
				)
			});
			setRepaired(true);
		}
	}, [
		formatsDispatch,
		formatsState,
		prefsDispatch,
		prefsState.storyFormat.name,
		prefsState.storyFormat.version,
		repaired,
		stories,
		storiesDispatch
	]);

	return inited && repaired ? <>{children}</> : <LoadingCurtain />;
};
