import * as React from 'react';
import classNames from 'classnames';
import './text-select.css';

export interface SelectOption {
	label: string;
	value: string;
}

export interface TextSelectProps {
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	options: SelectOption[];
	orientation?: 'horizontal' | 'vertical';
	value: string;
}

export const TextSelect: React.FC<TextSelectProps> = props => {
	const {children, onChange, options, orientation, value} = props;
	const className = classNames(
		'text-select',
		`orientation-${orientation ?? 'horizontal'}`
	);

	return (
		<span className={className}>
			<label>
				<span className="text-select-label">{children}</span>
				<select onChange={onChange} value={value}>
					{options.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>
		</span>
	);
};
