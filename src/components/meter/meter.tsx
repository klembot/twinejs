import * as React from 'react';
import './meter.css';

export interface MeterProps {
	domId: string;
	percent: number;
}

export const Meter: React.FC<MeterProps> = ({children, domId, percent}) => {
	return (
		<div
			className="meter"
			id={domId}
			role="meter"
			aria-labelledby={`${domId}-label`}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={percent * 100}
		>
			<div className="meter-bar">
				<span className="filled" style={{width: percent * 100 + '%'}}></span>
			</div>
			<div className="meter-label" id={`${domId}-label`}>
				{children}
			</div>
		</div>
	);
};
