import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {PromptButton, PromptButtonValidator} from '../control/prompt-button';
import {StoryFormat, StoryFormatProperties} from '../../store/story-formats';
import './add-story-format-button.css';
import {fetchStoryFormatProperties} from '../../util/story-format/fetch-properties';

export interface AddStoryFormatButtonProps {
	existingFormats: StoryFormat[];
	onAddFormat: (
		formatUrl: string,
		formatProperties: StoryFormatProperties
	) => void;
}

function isValidUrl(value: string) {
	try {
		new URL(value);
		return true;
	} catch (e) {}

	return false;
}

export const AddStoryFormatButton: React.FC<AddStoryFormatButtonProps> = props => {
	const [newFormatUrl, setNewFormatUrl] = React.useState('');
	const {t} = useTranslation();

	async function handleSubmit() {
		props.onAddFormat(
			newFormatUrl,
			await fetchStoryFormatProperties(newFormatUrl)
		);
	}

	const validate: PromptButtonValidator = async (value: string) => {
		if (newFormatUrl.trim() === '') {
			return {valid: false};
		}

		if (!isValidUrl(newFormatUrl)) {
			return {
				message: t('components.addStoryFormatButton.invalidUrl'),
				valid: false
			};
		}

		try {
			const properties = await fetchStoryFormatProperties(newFormatUrl);

			if (
				props.existingFormats.some(
					format =>
						format.name === properties.name &&
						format.version === properties.version
				)
			) {
				return {
					message: t('components.addStoryFormatButton.alreadyAdded', {
						storyFormatName: properties.name,
						storyFormatVersion: properties.version
					}),
					valid: false
				};
			}

			return {
				message: t('components.addStoryFormatButton.addPreview', {
					storyFormatName: properties.name,
					storyFormatVersion: properties.version
				}),
				valid: true
			};
		} catch (error) {
			return {
				message: t('components.addStoryFormatButton.fetchError', {
					errorMessage: error.message
				}),
				valid: false
			};
		}
	};

	return (
		<span className="add-story-format-button">
			<PromptButton
				icon={<IconPlus />}
				label={t('common.storyFormat')}
				onChange={event => setNewFormatUrl(event.target.value)}
				onSubmit={handleSubmit}
				prompt={t('components.addStoryFormatButton.prompt')}
				submitIcon={<IconPlus />}
				submitLabel={t('common.add')}
				submitVariant="create"
				validate={validate}
				value={newFormatUrl}
			/>
		</span>
	);
};
