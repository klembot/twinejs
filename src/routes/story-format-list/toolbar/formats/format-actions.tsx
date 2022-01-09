import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {StoryFormat} from '../../../../store/story-formats';
import {AddStoryFormatButton} from './add-story-format-button';
import {DefaultStoryFormatButton} from './default-story-format-button';
import {ProofingStoryFormatButton} from './proofing-story-format-button';
import {RemoveStoryFormatButton} from './remove-story-format-button';
import {StoryFormatExtensionsButton} from './story-format-extensions-button';

export interface FormatActionsProps {
	selectedFormats: StoryFormat[];
}

export const FormatActions: React.FC<FormatActionsProps> = props => {
	const {selectedFormats} = props;
	const format = selectedFormats.length === 1 ? selectedFormats[0] : undefined;

	return (
		<ButtonBar>
			<AddStoryFormatButton />
			<RemoveStoryFormatButton format={format} />
			<StoryFormatExtensionsButton format={format} />
			<DefaultStoryFormatButton format={format} />
			<ProofingStoryFormatButton format={format} />
		</ButtonBar>
	);
};
