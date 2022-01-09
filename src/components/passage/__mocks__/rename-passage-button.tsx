import * as React from 'react';
import {RenamePassageButtonProps} from '../rename-passage-button';

export const RenamePassageButton: React.FC<RenamePassageButtonProps> = props => (
	<button
		onClick={() => props.onRename('mock-new-passage-name')}
	>{`mock-rename-passage-button-${props.passage?.id}`}</button>
);
