import * as React from 'react';
import {useParams} from 'react-router-dom';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';

export const StoryProofRoute: React.FC = () => {
	const [inited, setInited] = React.useState(false);
	const {storyId} = useParams<{storyId: string}>();
	const {proofStory} = usePublishing();

	React.useEffect(() => {
		async function load() {
			replaceDom(await proofStory(storyId));
		}

		if (!inited) {
			setInited(true);
			load();
		}
	}, [inited, proofStory, storyId]);

	return null;
};
