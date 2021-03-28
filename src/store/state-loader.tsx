import * as React from 'react';
import {usePrefsContext} from './prefs/prefs-context';
import {useStoriesContext} from './stories/stories-context';
import {usePersistence} from './persistence/use-persistence';

export const StateLoader: React.FC = ({children}) => {
	const [inited, setInited] = React.useState(false);
	const {dispatch: prefsDispatch} = usePrefsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {prefs, stories} = usePersistence();

	React.useEffect(() => {
		if (!inited) {
			prefsDispatch({type: 'init', state: prefs.load()});
			storiesDispatch({type: 'init', state: stories.load()});
			setInited(true);
		}
	}, [inited, prefs, prefsDispatch, stories, storiesDispatch]);

	// TODO: Show a progress spinner
	return inited ? <>{children}</> : <p>Loading state</p>;
};
