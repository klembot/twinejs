import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IconCircle} from '@tabler/icons';
import {colors, Color} from '../../util/color';
import './color-select.css';

// TODO make this use <MenuButton>

export interface ColorSelectProps {
	label: string;
	onChange: (value: Color) => void;
	value: Color;
}

export const ColorSelect: React.FC<ColorSelectProps> = props => {
	const {label, onChange, value} = props;
	const {t} = useTranslation();

	return (
		<span className="color-select">
			<label>
				<span className="label">{label}</span>
				<span className="control">
					<span className={classNames('proxy', value)}>
						<IconCircle />
					</span>
					<select
						onChange={e => onChange(e.target.value as Color)}
						value={value}
					>
						{colors.map(color => (
							<option key={color} value={color}>
								{t(`colors.${color}`)}
							</option>
						))}
					</select>
				</span>
			</label>
		</span>
	);
};
