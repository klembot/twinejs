import * as React from 'react';
import './meter.css';

export interface MeterProps {
	percent: number;
}

// TODO: AX

export const Meter: React.FC<MeterProps> = ({children, percent}) => {
	return (
		<div className="meter">
			<div className="meter-bar">
				<span
					className="filled"
					style={{width: percent * 100 + '%'}}
				></span>
			</div>
			<div className="meter-label">{children}</div>
		</div>
	);
};
