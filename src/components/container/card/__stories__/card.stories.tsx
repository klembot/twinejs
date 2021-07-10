import * as React from 'react';
import {Story} from '@storybook/react';
import {IconCheck} from '@tabler/icons';
import {Card, CardProps} from '../card';
import {ButtonBar} from '../../button-bar';
import {CardContent} from '../card-content';
import {IconButton} from '../../../control/icon-button';

const main = {
	argTypes: {
		height: {defaultValue: 200, type: 'number'},
		width: {defaultValue: 200, type: 'number'}
	},
	component: Card,
	title: 'Container/<Card>'
};
export default main;

interface CardArgs extends CardProps {
	height: number;
	width: number;
}

const BaseTemplate: Story<CardArgs> = props => {
	const {height, width, ...other} = props;

	return (
		<div style={{height, width}}>
			<Card {...other}>Card</Card>
		</div>
	);
};

export const Base = BaseTemplate.bind({});

const HeaderAndBodyTemplate: Story<CardArgs> = props => {
	const {height, width, ...other} = props;

	return (
		<div style={{height, width}}>
			<Card {...other}>
				<h2>Header</h2>
				<CardContent>Body</CardContent>
			</Card>
		</div>
	);
};

export const HeaderAndBody = HeaderAndBodyTemplate.bind({});

const HeaderBodyFooterTemplate: Story<CardArgs> = props => {
	const {height, width, ...other} = props;

	return (
		<div style={{height, width}}>
			<Card {...other}>
				<h2>Header</h2>
				<CardContent>Body</CardContent>
				<ButtonBar>
					<IconButton icon={<IconCheck />} label="OK" variant="primary" />
				</ButtonBar>
			</Card>
		</div>
	);
};

export const HeaderBodyFooter = HeaderBodyFooterTemplate.bind({});
