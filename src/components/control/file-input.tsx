import classNames from 'classnames';
import * as React from 'react';
import './file-input.css';

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file

export interface FileInputProps {
	accept?: string;
	children: React.ReactNode;
	onChange: (file: File, data: string) => void;
	onError?: (error: Error) => void;
	orientation?: 'horizontal' | 'vertical';
}

export const FileInput: React.FC<FileInputProps> = props => {
	const {children, onChange, onError, orientation, ...otherProps} = props;
	const className = classNames(
		'file-input',
		`orientation-${orientation ?? 'horizontal'}`
	);

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
		<span className={className}>
			<label>
				<span className="file-input-label">{children}</span>
				<span className="file-input-control">
					<input {...otherProps} onChange={handleChange} type="file" />
				</span>
			</label>
		</span>
	);
};
