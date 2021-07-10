import classNames from 'classnames';
import * as React from 'react';
import './text-input.css';

export interface TextInputProps {
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
	orientation?: 'horizontal' | 'vertical';
	placeholder?: string;
	type?: 'search' | 'text';
	value: string;
}

export const TextInput: React.FC<TextInputProps> = props => {
	const className = classNames(
		'text-input',
		`orientation-${props.orientation}`,
		`type-${props.type}`
	);

	return (
		<span className={className}>
			<label>
				<span className="text-input-label">{props.children}</span>
				<input
					onChange={props.onChange}
					onInput={props.onInput}
					placeholder={props.placeholder}
					type={props.type ?? 'text'}
					value={props.value}
				/>
			</label>
		</span>
	);
};
