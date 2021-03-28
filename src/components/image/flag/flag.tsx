import * as React from 'react';
import classNames from 'classnames';
import 'flag-icon-css/css/flag-icon.css';
import './flag.css';

export interface FlagProps {
	countryCode: string;
	label?: string;
	square?: boolean;
}

export const Flag: React.FC<FlagProps> = props => {
	const {countryCode, label, square} = props;
	const className = classNames(
		'flag',
		'flag-icon',
		`flag-icon-${countryCode}`,
		{
			'flag-icon-squared': square
		}
	);

	return (
		<span aria-hidden={!label} aria-label={label} className={className} />
	);
};
