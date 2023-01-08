import * as React from 'react';
import {PassageEditStackProps} from '../passage-edit-stack';

export const PassageEditStack = (props: PassageEditStackProps) => (
	<div
		data-testid="mock-passage-edit-stack"
		data-passage-ids={JSON.stringify(props.passageIds)}
	/>
);
