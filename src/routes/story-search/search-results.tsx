import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {CardGroup} from '../../components/container/card-group';
import {PassageSearchCard} from '../../components/passage/passage-search-card';
import {
	replaceInPassage,
	useStoriesContext,
	PassageSearchResult,
	StorySearchFlags,
	Story
} from '../../store/stories';

export interface SearchResultsProps {
	flags: StorySearchFlags;
	replaceWith: string;
	results: PassageSearchResult[];
	searchFor: string;
	story: Story;
}

const cardWidth = '350px';

export const SearchResults: React.FC<SearchResultsProps> = props => {
	const {flags, replaceWith, results, searchFor, story} = props;
	const {dispatch} = useStoriesContext();
	const history = useHistory();
	const {t} = useTranslation();

	let content = <></>;

	if (searchFor !== '') {
		if (results.length > 0) {
			content = (
				<CardGroup columnWidth={cardWidth}>
					{results.map(result => (
						<PassageSearchCard
							{...result}
							key={result.passage.name}
							onEdit={() =>
								history.push(
									`/stories/${story.id}/passages/${result.passage.id}`
								)
							}
							onReplace={() =>
								replaceInPassage(
									dispatch,
									story,
									result.passage,
									searchFor,
									replaceWith,
									flags
								)
							}
						/>
					))}
				</CardGroup>
			);
		} else {
			content = <p>{t('storySearch.noMatches')}</p>;
		}
	}

	return <div className="search-results">{content}</div>;
};
