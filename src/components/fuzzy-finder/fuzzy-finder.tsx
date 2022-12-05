import {IconX} from '@tabler/icons';
import classnames from 'classnames';
import * as React from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {Card} from '../container/card';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {FuzzyFinderResult, FuzzyFinderResultProps} from './fuzzy-finder-result';
import './fuzzy-finder.css';

function elementIsFocused(element: HTMLElement | null): boolean {
	return !!(element && document.activeElement === element);
}

export interface FuzzyFinderProps {
	noResultsText: string;
	onChangeSearch: (value: string) => void;
	onClose: () => void;
	onSelectResult: (index: number) => void;
	prompt: string;
	results: Omit<FuzzyFinderResultProps, 'onClick'>[];
	search: string;
}

export const FuzzyFinder: React.FC<FuzzyFinderProps> = props => {
	const {
		noResultsText,
		onChangeSearch,
		onClose,
		onSelectResult,
		prompt,
		search,
		results
	} = props;
	const [selectedResult, setSelectedResult] = React.useState(0);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	useHotkeys(
		'escape',
		onClose,
		{
			enableOnTags: ['INPUT'],
			filter: () => elementIsFocused(inputRef.current)
		},
		[onClose]
	);
	useHotkeys(
		'return',
		() => onSelectResult(selectedResult),
		{
			enableOnTags: ['INPUT'],
			filter: () => elementIsFocused(inputRef.current)
		},
		[onSelectResult, selectedResult]
	);
	useHotkeys(
		'up',
		() =>
			setSelectedResult(value =>
				value === 0 ? results.length - 1 : value - 1
			),
		{
			enableOnTags: ['INPUT'],
			filter: () => elementIsFocused(inputRef.current)
		},
		[onSelectResult, selectedResult]
	);
	useHotkeys(
		'down',
		() =>
			setSelectedResult(value =>
				value === results.length - 1 ? 0 : value + 1
			),
		{
			enableOnTags: ['INPUT'],
			filter: () => elementIsFocused(inputRef.current)
		},
		[onSelectResult, selectedResult]
	);

	React.useEffect(() => {
		// Automatically focus the search input on mount.
		//
		// This timeout is needed to avoid stealing focus too early. If this
		// component is mounted in reaction to a hotkey, the input will receive the
		// hotkey input.

		const timeout = window.setTimeout(() => {
			if (containerRef.current) {
				containerRef.current.querySelector('input')?.focus();
			}
		}, 0);

		return () => window.clearTimeout(timeout);
	}, []);

	return (
		<div className="fuzzy-finder" ref={containerRef}>
			<Card>
				<div className="search">
					<TextInput
						onChange={event => onChangeSearch(event.target.value)}
						ref={inputRef}
						value={search}
					>
						{prompt}
					</TextInput>
					<IconButton
						icon={<IconX />}
						iconOnly
						label="Close"
						onClick={onClose}
						tooltipPosition="bottom"
					/>
				</div>
				<div
					className={classnames('results', {'has-results': results.length > 0})}
				>
					{search.length > 0 && results.length === 0 && (
						<div className="no-results">{noResultsText}</div>
					)}
					{search.length > 0 && results.length > 0 && (
						<ol>
							{results.map((props, index) => (
								<li key={props.heading}>
									<FuzzyFinderResult
										{...props}
										onClick={() => onSelectResult(index)}
										selected={index === selectedResult}
									/>
								</li>
							))}
						</ol>
					)}
				</div>
			</Card>
		</div>
	);
};
