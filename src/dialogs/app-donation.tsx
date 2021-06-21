import {IconHeart, IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../components/container/button-bar';
import {CardContent} from '../components/container/card';
import {DialogCard} from '../components/container/dialog-card';
import {IconButton} from '../components/control/icon-button';
import {IconLink} from '../components/control/icon-link';
import {setPref, usePrefsContext} from '../store/prefs';
import {DialogComponentProps} from './dialogs.types';

export const AppDonationDialog: React.FC<DialogComponentProps> = props => {
	const {dispatch} = usePrefsContext();
	const {t} = useTranslation();

	React.useEffect(() => dispatch(setPref('donateShown', true)), [dispatch]);

	return (
		<DialogCard
			{...props}
			className="app-donation-dialog"
			fixedSize
			headerLabel={t('dialogs.appDonation.title')}
		>
			<CardContent>
				<div className="text">
					<p>{t('dialogs.appDonation.supportMessage')}</p>
					<p>{t('dialogs.appDonation.onlyOnce')}</p>
				</div>
			</CardContent>
			<ButtonBar>
				<IconLink
					href="https://twinery.org/donate"
					icon={<IconHeart />}
					label={t('dialogs.appDonation.donate')}
					variant="primary"
				/>
				<IconButton
					icon={<IconX />}
					label={t('dialogs.appDonation.noThanks')}
					onClick={props.onClose}
				/>
			</ButtonBar>
		</DialogCard>
	);
};
