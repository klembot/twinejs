import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IconCode, IconHeart} from '@tabler/icons';
import {DialogCard} from '../../components/container/dialog-card';
import {IconLink} from '../../components/control/icon-link';
import {getAppInfo} from '../../util/app-info';
import {DialogComponentProps} from '../dialogs.types';
import credits from './credits.json';
import './about-twine.css';

export const AboutTwineDialog: React.FC<DialogComponentProps> = props => {
	const {t} = useTranslation();
	const info = getAppInfo();
	const className = classNames('about-twine-dialog', 'fixed-size', {
		collapsed: props.collapsed
	});

	return (
		<div className={className}>
			<DialogCard
				{...props}
				headerLabel={t('aboutTwine.title', {
					version: info.version
				})}
			>
				<div className="content">
					<p>{t('aboutTwine.twineDescription')}</p>
					<p
						dangerouslySetInnerHTML={{
							__html: t('aboutTwine.license')
						}}
					/>
					<div className="links">
						<IconLink
							href="https://twinery.org/donate"
							icon={<IconHeart />}
							label={t('aboutTwine.donateToTwine')}
							variant="primary"
						/>
						<IconLink
							href="https://github.com/klembot/twinejs"
							icon={<IconCode />}
							label={t('aboutTwine.codeRepo')}
						/>
					</div>
					<div className="credits">
						<div className="code">
							<h2>{t('aboutTwine.codeHeader')}</h2>
							<ul>
								{credits.code.map(c => (
									<li key={c}>{c}</li>
								))}
							</ul>
						</div>
						<div className="localizations">
							<h2>{t('aboutTwine.localizationHeader')}</h2>
							<ul>
								{credits.localizations.map(c => (
									<li key={c}>{c}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</DialogCard>
		</div>
	);
};
