import * as React from 'react';
import {Story} from '@storybook/react';
import {lorem} from 'faker';
import {CodeArea, CodeAreaProps} from '../code-area';

interface CodeAreaArgs extends CodeAreaProps {
	height: number;
	width: number;
}

const main = {component: CodeArea, title: 'Control/<CodeArea>'};
export default main;

const BaseTemplate: Story<CodeAreaArgs> = props => {
	const {height, width, ...other} = props;

	return (
		<div style={{height, width}}>
			<CodeArea {...other} />
		</div>
	);
};

export const PlainText = BaseTemplate.bind({});

PlainText.args = {
	options: {lineWrapping: true, mode: 'text'},
	value: lorem.paragraphs(10)
};
