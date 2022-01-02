import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {ArchiveButton} from './archive-button';
import {ImportStoryButton} from './import-story-button';
import {StoryTagsButton} from './story-tags-button';

export const LibraryActions: React.FC = () => (
	<ButtonBar>
		<StoryTagsButton />
		<ImportStoryButton />
		<ArchiveButton />
	</ButtonBar>
);
