import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {FileInput} from '../../components/control/file-input';
import {Story} from '../../store/stories';
import {importStories} from '../../util/import';

export interface UploadFileProps {
	onChange: (file: File, stories: Story[]) => void;
}

export const UploadFile: React.FC<UploadFileProps> = props => {
	const {onChange} = props;
	const {t} = useTranslation();

	function handleChange(file: File, data: string) {
		onChange(file, importStories(data));
	}

	return (
		<div className="upload-file">
			<p>{t('storyImport.uploadPrompt')}</p>
			<FileInput accept=".html" onChange={handleChange} />
		</div>
	);
};
