import * as React from 'react';
import {useParams} from 'react-router-dom';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';

export const StoryPlayRoute: React.FC = () => {
	const [inited, setInited] = React.useState(false);
	const {storyId} = useParams<{storyId: string}>();
	const {publishStory} = usePublishing();

	React.useEffect(() => {
		async function load() {
			replaceDom(await publishStory(storyId));
		}

		if (!inited) {
			setInited(true);
			load();
		}
	}, [inited, publishStory, storyId]);

	return null;
};
