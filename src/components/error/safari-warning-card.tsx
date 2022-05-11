import {IconInfoCircle} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import UAParser from 'ua-parser-js';
import {ButtonBar} from '../container/button-bar';
import {Card} from '../container/card';
import {IconLink} from '../control/icon-link';
import {ErrorMessage} from '../error';
import './safari-warning-card.css';

export interface SafariNavigator extends Navigator {
	standalone?: boolean;
}

export const SafariWarningCard: React.FC = props => {
	const {t} = useTranslation();
	const browser = new UAParser().getBrowser();

	if (browser.name !== 'Safari') {
		return null;
	}

	if (browser.version) {
		const version = parseInt(browser.version.replace(/\..*/, ''));

		if (Number.isFinite(version) && version < 13) {
			return null;
		}
	}

	const safariNavigator = window.navigator as SafariNavigator;

	if (safariNavigator.standalone) {
		// We are in "standalone" or full-screen mode. This is supposed to have
		// its own localStorage which is not subject to the seven-day limit.
		// https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
		return null;
	}

	const canAddToHomeScreen = safariNavigator.standalone !== undefined;

	return (
		<div className="safari-warning-card">
			<Card>
				<ErrorMessage>
					<p>{t('components.safariWarningCard.message')}</p>
					{canAddToHomeScreen && (
						<p>{t('components.safariWarningCard.addToHomeScreen')}</p>
					)}
					<p>{t('components.safariWarningCard.archiveAndUseAnotherBrowser')}</p>
				</ErrorMessage>
				<ButtonBar>
					<IconLink
						href="https://twinery.org/2ioslocalstorage"
						icon={<IconInfoCircle />}
						label={t('components.safariWarningCard.learnMore')}
						variant="primary"
					/>
					{canAddToHomeScreen && (
						<IconLink
							href="https://twinery.org/2ioshomescreen"
							icon={<IconInfoCircle />}
							label={t('components.safariWarningCard.howToAddToHomeScreen')}
						/>
					)}
				</ButtonBar>
			</Card>
		</div>
	);
};
