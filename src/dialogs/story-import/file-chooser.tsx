import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {FileInput} from '../../components/control/file-input';
import {Story} from '../../store/stories';
import {importStories} from '../../util/import';

export interface FileChooserProps {
	onChange: (file: File, stories: Story[]) => void;
}

export const FileChooser: React.FC<FileChooserProps> = props => {
	const {onChange} = props;
	const {t} = useTranslation();

	function handleChange(file: File, data: string) {
		onChange(file, importStories(data));
	}

	return (
		<div className="file-chooser">
			<p>
				<FileInput
					accept=".html"
					onChange={handleChange}
					orientation="vertical"
				>
					{t('dialogs.storyImport.filePrompt')}
				</FileInput>
			</p>
		</div>
	);
};
