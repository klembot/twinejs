import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCheck, IconX} from '@tabler/icons';
import {Modal} from '../../../components/modal/modal';
import {ButtonBar} from '../../../components/container/button-bar';
import {Card, CardContent} from '../../../components/container/card';
import {IconButton} from '../../../components/control/icon-button';
import {TextSelect} from '../../../components/control/text-select';
import {FormatLoader} from '../../../store/format-loader';
import {updateStory, Story, useStoriesContext} from '../../../store/stories';
import {
	formatWithId,
	formatWithNameAndVersion,
	StoryFormat,
	useStoryFormatsContext
} from '../../../store/story-formats';

// TODO make this a dialog, use <MenuButton>

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

export interface SetStoryModalProps {
	onClose: () => void;
	open: boolean;
	story: Story;
}

export const SetStoryFormatModal: React.FC<SetStoryModalProps> = props => {
	const {onClose, open, story} = props;
	const {formats} = useStoryFormatsContext();
	const [newFormat, setNewFormat] = React.useState<StoryFormat | undefined>(
		tryToGetStoryFormat(story, formats)
	);
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	const availableFormats = React.useMemo(
		() =>
			formats.filter(
				format => format.loadState === 'loaded' && !format.properties.proofing
			),
		[formats]
	);

	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setNewFormat(formatWithId(formats, event.target.value));
	}

	function handleSubmit() {
		if (!newFormat) {
			throw new Error('No format has been selected');
		}

		storiesDispatch(
			updateStory(stories, story, {
				storyFormat: newFormat.name,
				storyFormatVersion: newFormat.version
			})
		);
		onClose();
	}

	return (
		<Modal isOpen={open}>
			<div className="set-story-format-modal">
				<Card>
					<h2>{t('storyEdit.topBar.setStoryFormatPrompt')}</h2>
					<CardContent>
						<FormatLoader block>
							<TextSelect
								options={availableFormats.map(format => ({
									label: `${format.name} ${format.version}`,
									value: format.id
								}))}
								onChange={handleChange}
								value={newFormat ? newFormat.id : ''}
							/>
						</FormatLoader>
					</CardContent>
					<ButtonBar>
						<IconButton
							icon={<IconX />}
							label={t('common.cancel')}
							onClick={onClose}
						/>
						<IconButton
							buttonType="submit"
							icon={<IconCheck />}
							label={t('common.ok')}
							onClick={handleSubmit}
							variant="primary"
						/>
					</ButtonBar>
				</Card>
			</div>
		</Modal>
	);
};
