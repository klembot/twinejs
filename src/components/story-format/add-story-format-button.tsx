import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {StoryFormat, StoryFormatProperties} from '../../store/story-formats';
import './add-story-format-button.css';
import {fetchStoryFormatProperties} from '../../util/fetch-story-format-properties';

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
	const [fetchError, setFetchError] = React.useState<Error>();
	const [newFormatUrl, setNewFormatUrl] = React.useState('');
	const [
		newFormatProperties,
		setNewFormatProperties
	] = React.useState<StoryFormatProperties>();
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	React.useEffect(() => {
		async function fetchProperties() {
			if (isValidUrl(newFormatUrl)) {
				try {
					setNewFormatProperties(
						await fetchStoryFormatProperties(newFormatUrl)
					);
				} catch (e) {
					setFetchError(e);
				}
			}
		}

		setFetchError(undefined);
		setNewFormatProperties(undefined);
		fetchProperties();
	}, [newFormatUrl]);

	function handleAdd() {
		if (!newFormatProperties) {
			throw new Error('No format set');
		}

		props.onAddFormat(newFormatUrl, newFormatProperties);
		setOpen(false);
	}

	let addDisabled = !newFormatProperties;
	let status = '';

	if (newFormatUrl !== '' && !isValidUrl(newFormatUrl)) {
		status = t('components.addStoryFormatButton.invalidUrl');
	} else if (fetchError) {
		status = t('components.addStoryFormatButton.fetchError', {
			errorMessage: fetchError.message
		});
	} else if (newFormatProperties) {
		if (
			props.existingFormats.some(
				format =>
					format.name === newFormatProperties.name &&
					format.version === newFormatProperties.version
			)
		) {
			addDisabled = true;
			status = t('components.addStoryFormatButton.alreadyAdded', {
				storyFormatName: newFormatProperties.name,
				storyFormatVersion: newFormatProperties.version
			});
		} else {
			status = t('components.addStoryFormatButton.addPreview', {
				storyFormatName: newFormatProperties.name,
				storyFormatVersion: newFormatProperties.version
			});
		}
	}

	return (
		<span className="add-story-format-button">
			<CardButton
				icon={<IconPlus />}
				label={t('common.storyFormat')}
				open={open}
				onChangeOpen={setOpen}
			>
				<CardContent>
					<TextInput
						onChange={e => setNewFormatUrl(e.target.value)}
						orientation="vertical"
						value={newFormatUrl}
					>
						{t('components.addStoryFormatButton.prompt')}
					</TextInput>
					{status && <p>{status}</p>}
				</CardContent>
				<ButtonBar>
					<IconButton
						disabled={addDisabled}
						icon={<IconPlus />}
						label={t('common.add')}
						onClick={handleAdd}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
			</CardButton>
		</span>
	);
};
