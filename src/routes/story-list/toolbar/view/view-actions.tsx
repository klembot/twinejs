import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {storyTags, useStoriesContext} from '../../../../store/stories';
import {SortByButton} from './sort-by-button';
import {TagFilterButton} from './tag-filter-button';

export const ViewActions: React.FC = () => {
	const {stories} = useStoriesContext();

	return (
		<ButtonBar>
			<SortByButton />
			<TagFilterButton tags={storyTags(stories)} />
		</ButtonBar>
	);
};
