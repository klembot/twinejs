import * as React from 'react';
import classNames from 'classnames';
import './text-select.css';

export interface SelectOption {
	disabled?: boolean;
	label: string;
	value: string;
}

export interface TextSelectProps {
	children: React.ReactNode;
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
				<span className="text-select-control">
					<select onChange={onChange} value={value}>
						{options.map(option => (
							<option
								disabled={option.disabled}
								key={option.value}
								value={option.value}
							>
								{option.label}
							</option>
						))}
					</select>
				</span>
			</label>
		</span>
	);
};
