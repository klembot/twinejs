import {IconTool} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {Passage, Story} from '../../../../store/stories';
import {useStoryLaunch} from '../../../../store/use-story-launch';

export interface TestPassageButtonProps {
	passage?: Passage;
	story: Story;
}

export const TestPassageButton: React.FC<TestPassageButtonProps> = props => {
	const {passage, story} = props;
	const {testStory} = useStoryLaunch();
	const {t} = useTranslation();

	return (
		<IconButton
			disabled={!passage}
			icon={<IconTool />}
			label={t('routes.storyEdit.toolbar.testFromHere')}
			onClick={() => testStory(story.id, passage?.id)}
		/>
	);
};
