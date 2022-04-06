import * as React from 'react';

interface ControlledProps {
	value: string;
}

export const Controlled: React.FC<ControlledProps> = ({value}) => (
	<textarea onChange={jest.fn()} value={value} />
);
