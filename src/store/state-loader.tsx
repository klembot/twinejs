import * as React from 'react';
import {LoadingCurtain} from '../components/loading-curtain';
import {usePersistence} from './persistence/use-persistence';
import {usePrefsContext} from './prefs';
import {useStoriesContext} from './stories';
import {useStoryFormatsContext} from './story-formats';
import {useStoriesRepair} from './use-stories-repair';

export const StateLoader: React.FC = ({children}) => {
	const [initing, setIniting] = React.useState(false);
	const [inited, setInited] = React.useState(false);
	const [prefsRepaired, setPrefsRepaired] = React.useState(false);
	const [formatsRepaired, setFormatsRepaired] = React.useState(false);
	const [storiesRepaired, setStoriesRepaired] = React.useState(false);
	const {dispatch: prefsDispatch, prefs: prefsState} = usePrefsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {dispatch: formatsDispatch, formats: formatsState} =
		useStoryFormatsContext();
	const repairStories = useStoriesRepair();
	const {prefs, stories, storyFormats} = usePersistence();

	// Done in steps so that the repair action can see the inited state, and then
	// each repair action can see the results of the preceding ones.
	//
	// Repairs must go:
	// formats -> prefs (so it can repair bad format preferences) -> stories

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
		if (inited && !formatsRepaired) {
			formatsDispatch({type: 'repair'});
			setFormatsRepaired(true);
		}
	}, [formatsDispatch, formatsRepaired, inited]);

	React.useEffect(() => {
		if (inited && formatsRepaired && !prefsRepaired) {
			prefsDispatch({type: 'repair', allFormats: formatsState});
			setPrefsRepaired(true);
		}
	}, [formatsRepaired, formatsState, inited, prefsDispatch, prefsRepaired]);

	React.useEffect(() => {
		if (inited && formatsRepaired && prefsRepaired && !storiesRepaired) {
			repairStories();
			setStoriesRepaired(true);
		}
	}, [
		formatsDispatch,
		formatsRepaired,
		formatsState,
		inited,
		prefsDispatch,
		prefsRepaired,
		prefsState.storyFormat.name,
		prefsState.storyFormat.version,
		repairStories,
		stories,
		storiesDispatch,
		storiesRepaired
	]);

	return inited && formatsRepaired && prefsRepaired && storiesRepaired ? (
		<>{children}</>
	) : (
		<LoadingCurtain />
	);
};
