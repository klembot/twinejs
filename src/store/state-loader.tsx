import * as React from 'react';
import {defaults, usePrefsContext} from './prefs';
import {useStoriesContext} from './stories';
import {
	formatWithNameAndVersion,
	StoryFormat,
	useStoryFormatsContext
} from './story-formats';
import {usePersistence} from './persistence/use-persistence';
import {LoadingCurtain} from '../components/loading-curtain';

export const StateLoader: React.FC = ({children}) => {
	const [initing, setIniting] = React.useState(false);
	const [inited, setInited] = React.useState(false);
	const [repaired, setRepaired] = React.useState(false);
	const {dispatch: prefsDispatch, prefs: prefsState} = usePrefsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {dispatch: formatsDispatch, formats: formatsState} =
		useStoryFormatsContext();
	const {prefs, stories, storyFormats} = usePersistence();

	// Done in two steps so that the repair action can see the inited state.

	React.useEffect(() => {
		async function run() {
			if (!initing) {
				const formatsState = await storyFormats.load();
				const prefsState = await prefs.load();
				const storiesState = await stories.load();

				formatsDispatch({type: 'init', state: formatsState});
				prefsDispatch({type: 'init', state: prefsState});
				storiesDispatch({type: 'init', state: storiesState});
				setInited(true);
			}
		}

		run();
		setIniting(true);
	}, [
		formatsDispatch,
		inited,
		initing,
		prefs,
		prefsDispatch,
		stories,
		storiesDispatch,
		storyFormats
	]);

	React.useEffect(() => {
		if (!repaired && inited) {
			prefsDispatch({type: 'repair', allFormats: formatsState});
			formatsDispatch({type: 'repair'});

			// We try to repair stories to the user's preferred format, but perhaps
			// their prefs are out of date/corrupted. In that case, we use the default
			// one.

			let safeFormat: StoryFormat | undefined;

			try {
				safeFormat = formatWithNameAndVersion(
					formatsState,
					prefsState.storyFormat.name,
					prefsState.storyFormat.version
				);
			} catch {
				try {
					safeFormat = formatWithNameAndVersion(
						formatsState,
						defaults().storyFormat.name,
						defaults().storyFormat.version
					);
				} catch (error) {
					console.error(
						`Could not locate a safe story format, skipping story repair: ${
							(error as Error).message
						}`
					);
				}
			}

			if (safeFormat) {
				storiesDispatch({
					type: 'repair',
					allFormats: formatsState,
					defaultFormat: safeFormat
				});
			}
			setRepaired(true);
		}
	}, [
		formatsDispatch,
		formatsState,
		inited,
		prefsDispatch,
		prefsState.storyFormat.name,
		prefsState.storyFormat.version,
		repaired,
		stories,
		storiesDispatch
	]);

	return inited && repaired ? <>{children}</> : <LoadingCurtain />;
};
