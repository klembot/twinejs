import * as React from 'react';
import {Story} from '@storybook/react';
import {StoryCard, StoryCardProps} from '../story-card';
import {fakeStory} from '../../../test-util';

const main = {
	component: StoryCard,
	title: 'Story/<StoryCard>'
};
export default main;

const BaseTemplate: Story<StoryCardProps> = props => {
	return (
		<div style={{width: 500}}>
			<StoryCard {...props} />
		</div>
	);
};

export const Base = BaseTemplate.bind({});

Base.args = {story: fakeStory(100)};

export const OnePassage = BaseTemplate.bind({});

OnePassage.args = {story: fakeStory(1)};

export const NoPassages = BaseTemplate.bind({});

NoPassages.args = {story: fakeStory(0)};
