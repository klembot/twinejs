import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardActions, CardBody, CardHeader} from '../container/card';
import {IconButton} from '../control/icon-button';
import {PassageSearchResult} from '../../store/stories';

export interface PassageSearchCardProps extends PassageSearchResult {
	onEdit: () => void;
	onReplace: () => void;
}

export const PassageSearchCard: React.FC<PassageSearchCardProps> = props => {
	const {nameHighlighted, onEdit, onReplace, textHighlighted} = props;
	const {t} = useTranslation();

	return (
		<Card>
			<CardHeader>
				<span dangerouslySetInnerHTML={{__html: nameHighlighted}} />
			</CardHeader>
			<CardBody>
				<div dangerouslySetInnerHTML={{__html: textHighlighted}} />
			</CardBody>
			<CardActions>
				<IconButton
					icon="edit"
					label={t('components.passageSearchCard.editPassage')}
					onClick={onEdit}
				/>
				<IconButton
					icon="zap"
					label={t('components.passageSearchCard.replace')}
					onClick={onReplace}
					variant="danger"
				/>
			</CardActions>
		</Card>
	);
};
