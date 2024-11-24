import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../../components/container/button-bar';
import {CardContent} from '../../components/container/card';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {StoryFormatItem} from '../../components/story-format/story-format-item';
import {FormatLoader} from '../../store/format-loader';
import {setPref, usePrefsContext} from '../../store/prefs';
import {
	deleteFormat,
	filteredFormats,
	sortFormats,
	StoryFormat,
	useStoryFormatsContext
} from '../../store/story-formats';
import {AddStoryFormatButton} from './add-story-format-button';
import {StoryFormatsFilterButton} from './story-formats-filter-button';
import './story-formats.css';

export type StoryFormatsDialogProps = Omit<DialogCardProps, 'headerLabel'>;

export const StoryFormatsDialog: React.FC<StoryFormatsDialogProps> = props => {
	const {dispatch: formatsDispatch, formats} = useStoryFormatsContext();
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const visibleFormats = sortFormats(
		filteredFormats(formats, prefs.storyFormatListFilter)
	);

	function handleChangeEditorExtensionsDisabled(
		format: StoryFormat,
		disabled: boolean
	) {
		if (disabled) {
			prefsDispatch(
				setPref('disabledStoryFormatEditorExtensions', [
					...prefs.disabledStoryFormatEditorExtensions,
					{name: format.name, version: format.version}
				])
			);
		} else {
			prefsDispatch(
				setPref(
					'disabledStoryFormatEditorExtensions',
					prefs.disabledStoryFormatEditorExtensions.filter(
						f => f.name !== format.name || f.version !== format.version
					)
				)
			);
		}
	}

	function handleDelete(format: StoryFormat) {
		formatsDispatch(deleteFormat(format));
	}

	function handleUseAsDefault(format: StoryFormat) {
		prefsDispatch({
			type: 'update',
			name: 'storyFormat',
			value: {name: format.name, version: format.version}
		});
	}

	function handleUseAsProofing(format: StoryFormat) {
		prefsDispatch({
			type: 'update',
			name: 'proofingFormat',
			value: {name: format.name, version: format.version}
		});
	}

	return (
		<FormatLoader>
			<DialogCard
				{...props}
				className="story-formats-dialog"
				headerLabel={t('dialogs.storyFormats.title')}
			>
				<ButtonBar>
					<AddStoryFormatButton />
					<StoryFormatsFilterButton />
				</ButtonBar>
				<CardContent>
					{visibleFormats.length === 0 && (
						<p>{t('dialogs.storyFormats.noneVisible')}</p>
					)}
					{visibleFormats.map(format => (
						<StoryFormatItem
							defaultFormat={
								format.name === prefs.storyFormat.name &&
								format.version === prefs.storyFormat.version
							}
							editorExtensionsDisabled={prefs.disabledStoryFormatEditorExtensions.some(
								disabledFormat =>
									format.name === disabledFormat.name &&
									format.version === disabledFormat.version
							)}
							onChangeEditorExtensionsDisabled={value =>
								handleChangeEditorExtensionsDisabled(format, value)
							}
							onDelete={() => handleDelete(format)}
							onUseAsDefault={() => handleUseAsDefault(format)}
							onUseAsProofing={() => handleUseAsProofing(format)}
							proofingFormat={
								format.name === prefs.proofingFormat.name &&
								format.version === prefs.proofingFormat.version
							}
							format={format}
							key={format.id}
						/>
					))}
				</CardContent>
			</DialogCard>
		</FormatLoader>
	);
};
