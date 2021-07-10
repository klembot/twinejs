import * as React from 'react';
import {Story} from '@storybook/react';
import {CardGroup, CardGroupProps} from '../card-group';
import {Card} from '../card';

const main = {component: CardGroup, title: 'Container/<CardGroup>'};
export default main;

const Template: Story<CardGroupProps> = props => (
	<CardGroup {...props}>
		<Card>
			<div style={{width: 50, height: 100}} />
		</Card>
		<Card>
			<div style={{width: 75, height: 50}} />
		</Card>
		<Card>
			<div style={{width: 100, height: 200}} />
		</Card>
		<Card>
			<div style={{width: 25, height: 25}} />
		</Card>
		<Card>
			<div style={{width: 200, height: 300}} />
		</Card>
	</CardGroup>
);

export const FixedWidth = Template.bind({});

FixedWidth.args = {columnWidth: 400};

export const FixedColumnCount = Template.bind({});

FixedColumnCount.args = {columns: 3};
