import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import scroll from 'scroll';
import {CardGroup} from '../../components/container/card-group';
import {WelcomeCard} from '../../components/welcome/welcome-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {content} from './content';
import './welcome-route.css';

// TODO: images don't look good

export const WelcomeRoute = () => {
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
					document.documentElement || document.body,
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
			<CardGroup columns={1} maxWidth="45em">
				{visibleCards.map((card, index) => (
					<WelcomeCard
						key={card.title}
						image={card.image}
						nextLabel={card.nextLabel ? t(card.nextLabel) : t('common.next')}
						onNext={index === allCards.length - 1 ? finish : showNext}
						onSkip={finish}
						showSkip={index === 0}
						title={t(card.title)}
					>
						<div dangerouslySetInnerHTML={{__html: t(card.html)}} />
					</WelcomeCard>
				))}
			</CardGroup>
		</div>
	);
};
