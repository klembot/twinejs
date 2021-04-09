import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
	Card,
	CardFooter,
	CardBody,
	CardHeader
} from '../../components/container/card';
import {CardGroup} from '../../components/container/card-group';
import {IconButton} from '../../components/control/icon-button';
import {IconLink} from '../../components/control/icon-link';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {getAppInfo} from '../../util/app-info';
import credits from './credits.json';

export const AboutTwineRoute: React.FC = () => {
	const history = useHistory();
	const {t} = useTranslation();
	const info = getAppInfo();

	// TODO: make this look nicer

	return (
		<div className="about-twine-route">
			<TopBar>
				<IconButton
					icon="arrow-left"
					onClick={() => history.push('/')}
					label={t('storyList.title')}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('aboutTwine.title', info)}</h1>
				<CardGroup columns={1}>
					<Card>
						<CardBody>
							<p>{t('aboutTwine.twineDescription')}</p>
							<p
								dangerouslySetInnerHTML={{
									__html: t('aboutTwine.license')
								}}
							/>
							<CardFooter>
								<IconLink
									href="https://github.com/klembot/twinejs"
									icon="code"
									label={t('aboutTwine.codeRepo')}
								/>
								<IconLink
									href="https://twinery.org/donate"
									icon="heart"
									label={t('aboutTwine.donateToTwine')}
									variant="primary"
								/>
							</CardFooter>
						</CardBody>
					</Card>
				</CardGroup>
				<CardGroup columns={2}>
					<Card>
						<CardHeader>{t('aboutTwine.codeHeader')}</CardHeader>
						<CardBody>
							<ul>
								{credits.code.map(c => (
									<li key={c}>{c}</li>
								))}
							</ul>
						</CardBody>
					</Card>
					<Card>
						<CardHeader>{t('aboutTwine.localizationHeader')}</CardHeader>
						<CardBody>
							<ul>
								{credits.localizations.map(c => (
									<li key={c}>{c}</li>
								))}
							</ul>
						</CardBody>
					</Card>
				</CardGroup>
			</MainContent>
		</div>
	);
};
