import * as React from 'react';

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file

export interface FileInputProps {
	accept?: string;
	onChange: (file: File, data: string) => void;
	onError?: (error: Error) => void;
}

export const FileInput: React.FC<FileInputProps> = props => {
	const {children, onChange, onError, ...otherProps} = props;

	function handleChange(changeEvent: React.ChangeEvent<HTMLInputElement>) {
		if (!changeEvent.target.files) {
			throw new Error('Change event occurred but no files present');
		}

		const file = changeEvent.target.files[0];
		const reader = new FileReader();

		reader.addEventListener('loadend', loadEvent => {
			if (reader.error) {
				console.warn(reader.error);

				if (onError) {
					onError(reader.error);
				}
			} else {
				onChange(file, reader.result as string);
			}
		});

		reader.readAsText(file);
	}

	return (
		<span className="file-input">
			<input {...otherProps} onChange={handleChange} type="file" />
		</span>
	);
};
