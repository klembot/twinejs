import {IconFocus2} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';

export interface GoToPassageButtonProps {
	onOpenFuzzyFinder: () => void;
}

export const GoToPassageButton: React.FC<GoToPassageButtonProps> = props => {
	const {onOpenFuzzyFinder} = props;
	const {t} = useTranslation();

	useCommand({
		id: 'passage.goTo',
		label: t('hotkeys.commands.passage.goTo'),
		run: onOpenFuzzyFinder,
		scope: 'story-map'
	});

	return (
		<IconButton
			icon={<IconFocus2 />}
			label={t('routes.storyEdit.toolbar.goTo')}
			onClick={onOpenFuzzyFinder}
		/>
	);
};
