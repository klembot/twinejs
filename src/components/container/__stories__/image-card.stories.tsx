import * as React from 'react';
import {image} from 'faker';
import {Story} from '@storybook/react';
import {ImageCard, ImageCardProps} from '../image-card';

const main = {
	argTypes: {
		height: {defaultValue: 200, type: 'number'},
		imageBackground: {type: 'color'},
		width: {defaultValue: 400, type: 'number'}
	},
	component: ImageCard,
	title: 'Container/<ImageCard>'
};
export default main;

interface ImageCardArgs extends Omit<ImageCardProps, 'image'> {
	height: number;
	width: number;
}

const BaseTemplate: Story<ImageCardArgs> = props => {
	const {height, width, ...other} = props;

	return (
		<div style={{height, width}}>
			<ImageCard {...other} image={<img alt="" src={image.imageUrl()} />}>
				Card
			</ImageCard>
		</div>
	);
};

export const Base = BaseTemplate.bind({});

export const ImageBackground = BaseTemplate.bind({});

ImageBackground.args = {imageBackground: 'blue'};

export const Tinted = BaseTemplate.bind({});

ImageBackground.args = {tint: 'wheat'};
