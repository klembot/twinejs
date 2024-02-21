import * as React from 'react';
import {TagEditorProps} from '../tag-editor';

export const TagEditor: React.FC<TagEditorProps> = props => (
	<div data-testid={`mock-tag-editor-${props.name}`}>
		<button onClick={() => props.onChangeColor('mock-color')}>
			onChangeColor
		</button>
		<button onClick={() => props.onChangeName('mock-new-name')}>
			onChangeName
		</button>
		<span>{`${props.count} ${props.count > 1 ? 'passages' : 'passage'}`}</span>
	</div>
);
