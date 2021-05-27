import * as React from 'react';
import {usePrefsContext} from './prefs/prefs-context';
import {useStoriesContext} from './stories/stories-context';
import {useStoryFormatsContext} from './story-formats/story-formats-context';
import {usePersistence} from './persistence/use-persistence';
import {LoadingCurtain} from '../components/loading-curtain';

export const StateLoader: React.FC = ({children}) => {
	const [inited, setInited] = React.useState(false);
	const {dispatch: prefsDispatch} = usePrefsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {dispatch: formatsDispatch} = useStoryFormatsContext();
	const {prefs, stories, storyFormats} = usePersistence();

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

	return inited ? <>{children}</> : <LoadingCurtain />;
};
