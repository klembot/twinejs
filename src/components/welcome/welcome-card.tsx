import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconArrowRight, IconArrowBarToRight} from '@tabler/icons';
import {CardFooter, CardBody, CardHeader, CardProps} from '../container/card';
import {ImageCard} from '../container/image-card';
import {IconButton} from '../control/icon-button';
import './welcome-card.css';

export interface WelcomeCardProps extends CardProps {
	image?: React.ReactNode;
	nextLabel: string;
	onNext: () => void;
	onSkip: () => void;
	showSkip: boolean;
	title: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = props => {
	const {
		children,
		image,
		nextLabel,
		onNext,
		onSkip,
		showSkip,
		title,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<div className="welcome-card">
			<ImageCard image={image} {...otherProps}>
				<CardHeader>{title}</CardHeader>
				<CardBody>{children}</CardBody>
				<CardFooter>
					{showSkip && (
						<IconButton
							icon={<IconArrowBarToRight />}
							label={t('common.skip')}
							onClick={onSkip}
						/>
					)}
					<IconButton
						icon={<IconArrowRight />}
						variant="primary"
						onClick={onNext}
						label={nextLabel}
					/>
				</CardFooter>
			</ImageCard>
		</div>
	);
};
