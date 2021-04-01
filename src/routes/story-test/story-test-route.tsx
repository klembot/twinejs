import * as React from 'react';
import {useParams} from 'react-router-dom';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';

export const StoryTestRoute: React.FC = () => {
	const [inited, setInited] = React.useState(false);
	const {passageId, storyId} = useParams<{
		passageId: string;
		storyId: string;
	}>();
	const {publishStory} = usePublishing();

	React.useEffect(() => {
		async function load() {
			replaceDom(
				await publishStory(storyId, {
					formatOptions: 'debug',
					startId: passageId
				})
			);
		}

		if (!inited) {
			setInited(true);
			load();
		}
	}, [inited, passageId, publishStory, storyId]);

	return null;
};
