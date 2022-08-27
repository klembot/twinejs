import {
	IconEye,
	IconFileText,
	IconPlayerPlay,
	IconTool,
	IconX
} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next/';
import {ButtonBar} from '../components/container/button-bar';
import {CardContent} from '../components/container/card';
import {CardButton} from '../components/control/card-button';
import {IconButton} from '../components/control/icon-button';
import {storyFileName} from '../electron/shared';
import {Story} from '../store/stories';
import {usePublishing} from '../store/use-publishing';
import {useStoryLaunch} from '../store/use-story-launch';
import {saveHtml} from '../util/save-html';

export interface BuildActionsProps {
	story?: Story;
}

export const BuildActions: React.FC<BuildActionsProps> = ({story}) => {
	const {publishStory} = usePublishing();
	const [playError, setPlayError] = React.useState<Error>();
	const [proofError, setProofError] = React.useState<Error>();
	const [publishError, setPublishError] = React.useState<Error>();
	const [testError, setTestError] = React.useState<Error>();
	const {playStory, proofStory, testStory} = useStoryLaunch();
	const {t} = useTranslation();

	function resetErrors() {
		setPlayError(undefined);
		setProofError(undefined);
		setPublishError(undefined);
		setTestError(undefined);
	}

	async function handlePlay() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		resetErrors();

		try {
			await playStory(story.id);
		} catch (error) {
			setPlayError(error as Error);
		}
	}

	async function handleProof() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		resetErrors();

		try {
			await proofStory(story.id);
		} catch (error) {
			setProofError(error as Error);
		}
	}

	async function handlePublishFile() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		resetErrors();

		try {
			saveHtml(await publishStory(story.id), storyFileName(story));
		} catch (error) {
			setPublishError(error as Error);
		}
	}

	async function handleTest() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		resetErrors();

		try {
			await testStory(story.id);
		} catch (error) {
			setTestError(error as Error);
		}
	}

	return (
		<ButtonBar>
			<CardButton
				ariaLabel={testError?.message ?? ''}
				disabled={!story}
				icon={<IconTool />}
				label={t('routeActions.build.test')}
				onChangeOpen={() => setTestError(undefined)}
				onClick={handleTest}
				open={!!testError}
			>
				<CardContent>
					<p>{testError?.message}</p>
					<IconButton
						icon={<IconX />}
						label={t('common.close')}
						onClick={() => setTestError(undefined)}
						variant="primary"
					/>
				</CardContent>
			</CardButton>
			<CardButton
				ariaLabel={playError?.message ?? ''}
				disabled={!story}
				icon={<IconPlayerPlay />}
				label={t('routeActions.build.play')}
				onChangeOpen={() => setPlayError(undefined)}
				onClick={handlePlay}
				open={!!playError}
			>
				<CardContent>
					<p>{playError?.message}</p>
					<IconButton
						icon={<IconX />}
						label={t('common.close')}
						onClick={() => setPlayError(undefined)}
						variant="primary"
					/>
				</CardContent>
			</CardButton>
			<CardButton
				ariaLabel={proofError?.message ?? ''}
				disabled={!story}
				icon={<IconEye />}
				label={t('routeActions.build.proof')}
				onChangeOpen={() => setProofError(undefined)}
				onClick={handleProof}
				open={!!proofError}
			>
				<CardContent>
					<p>{proofError?.message}</p>
					<IconButton
						icon={<IconX />}
						label={t('common.close')}
						onClick={() => setProofError(undefined)}
						variant="primary"
					/>
				</CardContent>
			</CardButton>
			<CardButton
				ariaLabel={publishError?.message ?? ''}
				disabled={!story}
				icon={<IconFileText />}
				label={t('routeActions.build.publishToFile')}
				onChangeOpen={() => setPublishError(undefined)}
				onClick={handlePublishFile}
				open={!!publishError}
			>
				<CardContent>
					<p>{publishError?.message}</p>
					<IconButton
						icon={<IconX />}
						label={t('common.close')}
						onClick={() => setPublishError(undefined)}
						variant="primary"
					/>
				</CardContent>
			</CardButton>
		</ButtonBar>
	);
};
