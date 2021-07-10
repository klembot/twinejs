import * as React from 'react';
import {Story} from '@storybook/react';
import {DialogCard, DialogCardProps} from '../dialog-card';

const main = {component: DialogCard, title: 'Container/<DialogCard>'};
export default main;

const Template: Story<DialogCardProps> = props => (
	<DialogCard {...props}>Card</DialogCard>
);

export const Expanded = Template.bind({});

Expanded.args = {headerLabel: 'Header'};

export const Collapsed = Template.bind({});

Collapsed.args = {collapsed: true, headerLabel: 'Header'};
