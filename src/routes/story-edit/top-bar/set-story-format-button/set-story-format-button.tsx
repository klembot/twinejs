import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {Story, useStoriesContext, updateStory} from '../../../../store/stories';
import {
	formatWithId,
	formatWithNameAndVersion,
	StoryFormat,
	useStoryFormatsContext
} from '../../../../store/story-formats';
import {StoryFormatModal} from './story-format-modal';

export interface SetStoryFormatButtonProps {
	onCancelChange?: () => void;
	onChange?: () => void;
	story: Story;
}

function tryToGetStoryFormat(story: Story, formats: StoryFormat[]) {
	try {
		return formatWithNameAndVersion(
			formats,
			story.storyFormat,
			story.storyFormatVersion
		);
	} catch (e) {
		console.warn(
			`Could not find format for story "${story.name}", wanted "${story.storyFormat}" version "${story.storyFormatVersion}".`
		);
	}
}

export const SetStoryFormatButton: React.FC<SetStoryFormatButtonProps> = props => {
	const {onCancelChange, onChange, story} = props;
	const [modalOpen, setModalOpen] = React.useState(false);
	const {dispatch, stories} = useStoriesContext();
	const {formats} = useStoryFormatsContext();
	const [newFormat, setNewFormat] = React.useState<StoryFormat | undefined>(
		tryToGetStoryFormat(story, formats)
	);
	const {t} = useTranslation();

	function toggleModal() {
		if (!modalOpen) {
			setNewFormat(tryToGetStoryFormat(story, formats));
		} else {
			if (onCancelChange) {
				onCancelChange();
			}
		}

		setModalOpen(open => !open);
	}

	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setNewFormat(formatWithId(formats, event.target.value));
	}

	function handleSubmit() {
		if (!newFormat) {
			throw new Error('No new format to set');
		}

		updateStory(dispatch, stories, story, {
			storyFormat: newFormat.name,
			storyFormatVersion: newFormat.version
		});

		if (onChange) {
			onChange();
		}

		toggleModal();
	}

	return (
		<>
			<IconButton
				icon="file-text"
				label={t('storyEdit.topBar.setStoryFormat')}
				onClick={toggleModal}
			/>
			<StoryFormatModal
				isOpen={modalOpen}
				message={t('storyEdit.topBar.setStoryFormatPrompt')}
				onCancel={toggleModal}
				onChange={handleChange}
				onSubmit={handleSubmit}
				value={newFormat}
			/>
		</>
	);
};
