import * as React from 'react';
import {useParams} from 'react-router-dom';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';
import {ErrorMessage} from '../../components/error';

export const StoryProofRoute: React.FC = () => {
	const [publishError, setPublishError] = React.useState<Error>();
	const [inited, setInited] = React.useState(false);
	const {storyId} = useParams<{storyId: string}>();
	const {proofStory} = usePublishing();

	React.useEffect(() => {
		async function load() {
			try {
				replaceDom(await proofStory(storyId));
			} catch (error) {
				setPublishError(error as Error);
			}
		}

		if (!inited) {
			setInited(true);
			load();
		}
	}, [inited, proofStory, storyId]);

	if (publishError) {
		return <ErrorMessage>{publishError.message}</ErrorMessage>;
	}

	return null;
};
