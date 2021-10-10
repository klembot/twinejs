import * as React from 'react';
import {Story} from '@storybook/react';
import {PassageCard, PassageCardProps} from '../passage-card';
import {fakePassage} from '../../../test-util';

const main = {
	component: PassageCard,
	title: 'Passage/<PassageCard>'
};
export default main;

const BaseTemplate: Story<PassageCardProps> = props => {
	return <PassageCard {...props} />;
};

export const Deselected = BaseTemplate.bind({});

Deselected.args = {
	passage: fakePassage({highlighted: false, left: 50, selected: false, top: 50})
};

export const Selected = BaseTemplate.bind({});

Selected.args = {
	passage: fakePassage({highlighted: false, left: 50, selected: true, top: 50})
};

export const Highlighted = BaseTemplate.bind({});

Highlighted.args = {
	passage: fakePassage({highlighted: true, left: 50, selected: false, top: 50})
};
