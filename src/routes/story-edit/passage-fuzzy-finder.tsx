import debounce from 'lodash/debounce';
import * as React from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useTranslation} from 'react-i18next';
import {CSSTransition} from 'react-transition-group';
import {FuzzyFinder} from '../../components/fuzzy-finder';
import {
	passagesMatchingFuzzySearch,
	selectPassage,
	Story,
	useStoriesContext
} from '../../store/stories';
import {Point} from '../../util/geometry';

export interface PassageFuzzyFinderProps {
	onClose: () => void;
	onOpen: () => void;
	open?: boolean;
	setCenter: (value: Point) => void;
	story: Story;
}

export const PassageFuzzyFinder: React.FC<PassageFuzzyFinderProps> = props => {
	const {onClose, onOpen, open, setCenter, story} = props;
	const {dispatch} = useStoriesContext();
	const [search, setSearch] = React.useState('');
	const [debouncedSearch, setDebouncedSearch] = React.useState('');
	const updateDebouncedSearch = React.useMemo(
		() =>
			debounce(
				(value: string) => {
					setDebouncedSearch(value);
				},
				100,
				{leading: true, trailing: true}
			),
		[]
	);
	const matches = React.useMemo(
		() => passagesMatchingFuzzySearch(story.passages, debouncedSearch),
		[debouncedSearch, story.passages]
	);
	const results = React.useMemo(
		() =>
			matches.map(({name, text}) => ({
				heading: name,
				detail: text
			})),
		[matches]
	);
	useHotkeys('p', onOpen);
	const {t} = useTranslation();

	function handleChangeSearch(value: string) {
		setSearch(value);
		updateDebouncedSearch(value);
	}

	function handleSelectResult(index: number) {
		setCenter(matches[index]);
		dispatch(selectPassage(story, matches[index], true));
		setSearch('');
		onClose();
	}

	return (
		<CSSTransition
			classNames="pop"
			mountOnEnter
			timeout={200}
			unmountOnExit
			in={open}
		>
			<FuzzyFinder
				noResultsText={t('components.passageFuzzyFinder.noResults')}
				onClose={onClose}
				onChangeSearch={handleChangeSearch}
				onSelectResult={handleSelectResult}
				prompt={t('components.passageFuzzyFinder.prompt')}
				search={search}
				results={results}
			/>
		</CSSTransition>
	);
};
