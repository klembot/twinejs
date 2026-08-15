import {IconTool} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {Passage, Story} from '../../../../store/stories';
import {useStoryLaunch} from '../../../../store/use-story-launch';

export interface TestPassageButtonProps {
	/**
	 * Scope the `passage.test` command registers in. Pass null in the passage
	 * editor: the story map toolbar already owns this shortcut, and a bare
	 * letter has no business firing while someone is writing.
	 */
	hotkeyScope?: string | null;
	passage?: Passage;
	story: Story;
}

export const TestPassageButton: React.FC<TestPassageButtonProps> = props => {
	const {hotkeyScope = 'story-map', passage, story} = props;
	const {testStory} = useStoryLaunch();
	const {t} = useTranslation();

	useCommand({
		enabled: !!passage,
		id: 'passage.test',
		label: t('hotkeys.commands.passage.test'),
		run: () => testStory(story.id, passage?.id),
		scope: hotkeyScope
	});

	return (
		<IconButton
			disabled={!passage}
			icon={<IconTool />}
			label={t('routes.storyEdit.toolbar.testFromHere')}
			onClick={() => testStory(story.id, passage?.id)}
		/>
	);
};
