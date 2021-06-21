import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCode, IconHeart} from '@tabler/icons';
import {ButtonBar} from '../../components/container/button-bar';
import {DialogCard} from '../../components/container/dialog-card';
import {IconLink} from '../../components/control/icon-link';
import {getAppInfo} from '../../util/app-info';
import {DialogComponentProps} from '../dialogs.types';
import credits from './credits.json';
import './about-twine.css';

export const AboutTwineDialog: React.FC<DialogComponentProps> = props => {
	const {t} = useTranslation();
	const info = getAppInfo();

	return (
		<DialogCard
			{...props}
			className="about-twine-dialog"
			fixedSize
			headerLabel={t('dialogs.aboutTwine.title', {
				version: info.version
			})}
		>
			<div className="content">
				<p>{t('dialogs.aboutTwine.twineDescription')}</p>
				<p
					dangerouslySetInnerHTML={{
						__html: t('dialogs.aboutTwine.license')
					}}
				/>
				<div className="credits">
					<div className="code">
						<h3>{t('dialogs.aboutTwine.codeHeader')}</h3>
						<ul>
							{credits.code.map(c => (
								<li key={c}>{c}</li>
							))}
						</ul>
					</div>
					<div className="localizations">
						<h3>{t('dialogs.aboutTwine.localizationHeader')}</h3>
						<ul>
							{credits.localizations.map(c => (
								<li key={c}>{c}</li>
							))}
						</ul>
					</div>
				</div>
				<ButtonBar>
					<IconLink
						href="https://twinery.org/donate"
						icon={<IconHeart />}
						label={t('dialogs.aboutTwine.donateToTwine')}
						variant="primary"
					/>
					<IconLink
						href="https://github.com/klembot/twinejs"
						icon={<IconCode />}
						label={t('dialogs.aboutTwine.codeRepo')}
					/>
				</ButtonBar>
			</div>
		</DialogCard>
	);
};
