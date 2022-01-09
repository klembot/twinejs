import * as React from 'react';
import {Helmet} from 'react-helmet';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import scroll from 'scroll';
import {WelcomeCard} from '../../components/welcome/welcome-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {content} from './content';
import './welcome-route.css';

export const WelcomeRoute: React.FC = () => {
	const containerEl = React.useRef<HTMLDivElement>(null);
	const {dispatch} = usePrefsContext();
	const history = useHistory();
	const [shown, setShown] = React.useState(1);
	const allCards = React.useMemo(content, []);
	const visibleCards = React.useMemo(() => allCards.slice(0, shown), [
		allCards,
		shown
	]);
	const {t} = useTranslation();

	React.useEffect(() => {
		if (containerEl.current) {
			const lastCard = containerEl.current.querySelector(
				'.welcome-card:last-of-type'
			);

			if (lastCard) {
				scroll.top(
					document.documentElement ?? document.body,
					(lastCard as HTMLElement).offsetTop,
					{duration: 400}
				);
			}
		}
	}, [shown]);

	const finish = () => {
		dispatch(setPref('welcomeSeen', true));
		history.push('/');
	};

	const showNext = () => setShown(shown => shown + 1);

	return (
		<div className="welcome-route" ref={containerEl}>
			<Helmet>
				<title>{t('routes.welcome.greetingTitle')}</title>
			</Helmet>
			<div className="cards">
				<TransitionGroup component={null}>
					{visibleCards.map((card, index) => (
						<CSSTransition classNames="pop" key={card.title} timeout={200}>
							<WelcomeCard
								image={card.image}
								nextLabel={
									card.nextLabel ? t(card.nextLabel) : t('common.next')
								}
								onNext={index === allCards.length - 1 ? finish : showNext}
								onSkip={finish}
								showSkip={index === 0}
								title={t(card.title)}
							>
								<div dangerouslySetInnerHTML={{__html: t(card.html)}} />
							</WelcomeCard>
						</CSSTransition>
					))}
				</TransitionGroup>
			</div>
		</div>
	);
};
