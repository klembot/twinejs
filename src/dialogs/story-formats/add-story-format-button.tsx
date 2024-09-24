import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {
	createFromProperties,
	useStoryFormatsContext
} from '../../store/story-formats';
import {
	PromptButton,
	PromptButtonValidator
} from '../../components/control/prompt-button';
import {fetchStoryFormatProperties} from '../../util/story-format';
import './add-story-format-button.css';

function isValidUrl(value: string) {
	try {
		new URL(value);
		return true;
	} catch (e) {
		/* empty */
	}

	return false;
}

export const AddStoryFormatButton: React.FC = () => {
	const {dispatch, formats} = useStoryFormatsContext();
	const [newFormatUrl, setNewFormatUrl] = React.useState('');
	const {t} = useTranslation();

	async function handleSubmit() {
		dispatch(
			createFromProperties(
				newFormatUrl,
				await fetchStoryFormatProperties(newFormatUrl)
			)
		);
	}

	const validate: PromptButtonValidator = async () => {
		if (newFormatUrl.trim() === '') {
			return {valid: false};
		}

		if (!isValidUrl(newFormatUrl)) {
			return {
				message: t('dialogs.storyFormats.addStoryFormatButton.invalidUrl'),
				valid: false
			};
		}

		try {
			const properties = await fetchStoryFormatProperties(newFormatUrl);

			if (
				formats.some(
					format =>
						format.name === properties.name &&
						format.version === properties.version
				)
			) {
				return {
					message: t('dialogs.storyFormats.addStoryFormatButton.alreadyAdded', {
						storyFormatName: properties.name,
						storyFormatVersion: properties.version
					}),
					valid: false
				};
			}

			return {
				message: t('dialogs.storyFormats.addStoryFormatButton.addPreview', {
					storyFormatName: properties.name,
					storyFormatVersion: properties.version
				}),
				valid: true
			};
		} catch (error) {
			return {
				message: t('dialogs.storyFormats.addStoryFormatButton.fetchError', {
					errorMessage: (error as Error).message
				}),
				valid: false
			};
		}
	};

	return (
		<span className="add-format-button">
			<PromptButton
				icon={<IconPlus />}
				label={t('common.add')}
				onChange={event => setNewFormatUrl(event.target.value)}
				onSubmit={handleSubmit}
				prompt={t('dialogs.storyFormats.addStoryFormatButton.prompt')}
				submitIcon={<IconPlus />}
				submitLabel={t('common.add')}
				submitVariant="create"
				validate={validate}
				validateOn="submit"
				value={newFormatUrl}
			/>
		</span>
	);
};
