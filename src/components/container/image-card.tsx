import * as React from 'react';
import {Card, CardProps} from './card';
import './image-card.css';

export interface ImageCardProps extends CardProps {
	image: React.ReactNode;
}

export const ImageCard: React.FC<ImageCardProps> = props => {
	const {children, image, ...otherProps} = props;

	return (
		<div className="image-card">
			<Card {...otherProps}>
				<div className="image-card-image">{image}</div>
				<div className="image-card-content">{children}</div>
			</Card>
		</div>
	);
};
