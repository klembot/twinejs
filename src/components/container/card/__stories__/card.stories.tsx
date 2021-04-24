import * as React from 'react';
import {Story} from '@storybook/react';
import {IconCheck} from '@tabler/icons';
import {Card, CardProps} from '../card';
import {CardFooter} from '../card-footer';
import {CardBody} from '../card-body';
import {CardHeader} from '../card-header';
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
				<CardHeader>Header</CardHeader>
				<CardBody>Body</CardBody>
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
				<CardHeader>Header</CardHeader>
				<CardBody>Body</CardBody>
				<CardFooter>
					Text
					<IconButton icon={<IconCheck />} label="OK" variant="primary" />
				</CardFooter>
			</Card>
		</div>
	);
};

export const HeaderBodyFooter = HeaderBodyFooterTemplate.bind({});
