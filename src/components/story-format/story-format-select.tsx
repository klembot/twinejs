import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {StoryFormat, sortFormats} from '../../store/story-formats';
import {TextSelect, TextSelectProps} from '../control/text-select';

export interface StoryFormatSelectProps
	extends Omit<TextSelectProps, 'options' | 'value'> {
	formats: StoryFormat[];
	selectedFormat: StoryFormat;
}

export const StoryFormatSelect: React.FC<StoryFormatSelectProps> = props => {
	const {formats, selectedFormat, ...other} = props;
	const {t} = useTranslation();
	const loadingFormats = formats.filter(
		format => format.loadState === 'loading'
	);
	const visibleFormats = sortFormats(
		formats.filter(
			format => format.loadState === 'loaded' || format.id === selectedFormat.id
		)
	);
	const options = visibleFormats.map(format => ({
		disabled: false,
		label: `${format.name} ${format.version}`,
		value: format.id
	}));

	if (loadingFormats.length !== 0) {
		options.push({
			disabled: true,
			label: t('components.storyFormatSelect.loadingCount', {
				loadingCount: loadingFormats.length
			}),
			value: ''
		});
	}

	return <TextSelect {...other} options={options} value={selectedFormat.id} />;
};
