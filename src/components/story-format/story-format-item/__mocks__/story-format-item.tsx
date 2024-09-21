import * as React from 'react';
import {StoryFormatItemProps} from '../story-format-item';

export const StoryFormatItem: React.FC<StoryFormatItemProps> = ({
	defaultFormat,
	editorExtensionsDisabled,
	format,
	onChangeEditorExtensionsDisabled,
	onDelete,
	onUseAsDefault,
	onUseAsProofing,
	proofingFormat
}) => {
	return (
		<div
			data-testid="mock-story-format-item"
			data-default-format={defaultFormat}
			data-editor-extensions-disabled={editorExtensionsDisabled}
			data-format-id={format.id}
			data-proofing-format={proofingFormat}
		>
			<button onClick={() => onChangeEditorExtensionsDisabled(true)}>
				onChangeEditorExtensionsDisabled true
			</button>
			<button onClick={() => onChangeEditorExtensionsDisabled(false)}>
				onChangeEditorExtensionsDisabled false
			</button>
			<button onClick={onDelete}>onDelete</button>
			<button onClick={onUseAsDefault}>onUseAsDefault</button>
			<button onClick={onUseAsProofing}>onUseAsProofing</button>
		</div>
	);
};
