import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {ClickAwayListener} from '../../components/click-away-listener';
import {CardGroup} from '../../components/container/card-group';
import {MainContent} from '../../components/container/main-content';
import {StoryFormatCard} from '../../components/story-format/story-format-card/story-format-card';
import {DialogsContextProvider} from '../../dialogs';
import {FormatLoader} from '../../store/format-loader';
import {usePrefsContext} from '../../store/prefs';
import {
	deselectAllFormats,
	deselectFormat,
	filteredFormats,
	selectFormat,
	sortFormats,
	StoryFormat,
	useStoryFormatsContext
} from '../../store/story-formats';
import {StoryFormatListToolbar} from './toolbar';

export const StoryFormatListRoute: React.FC = () => {
	const {dispatch: formatsDispatch, formats} = useStoryFormatsContext();
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const selectedFormats = formats.filter(format => format.selected);

	const visibleFormats = sortFormats(
		filteredFormats(formats, prefs.storyFormatListFilter)
	);

	// Any formats no longer visible should be deselected.

	React.useEffect(() => {
		for (const format of selectedFormats) {
			if (format.selected && !visibleFormats.includes(format)) {
				formatsDispatch(deselectFormat(format));
			}
		}
	}, [prefsDispatch, selectedFormats, visibleFormats, formatsDispatch]);

	function handleSelect(format: StoryFormat) {
		formatsDispatch(selectFormat(format, true));
	}

	return (
		<div className="story-format-list-route">
			<DialogsContextProvider>
				<StoryFormatListToolbar selectedFormats={selectedFormats} />
				<ClickAwayListener
					ignoreSelector=".story-format-card"
					onClickAway={() => formatsDispatch(deselectAllFormats())}
				>
					<MainContent
						title={t(
							`routes.storyFormatList.title.${prefs.storyFormatListFilter}`
						)}
					>
						<p>
							{t(
								visibleFormats.length > 0
									? 'routes.storyFormatList.storyFormatExplanation'
									: 'routes.storyFormatList.noneVisible'
							)}
						</p>
						<FormatLoader>
							<CardGroup columnWidth="450px">
								<TransitionGroup component={null}>
									{visibleFormats.map(format => (
										<CSSTransition
											classNames="pop"
											key={format.id}
											timeout={200}
										>
											<StoryFormatCard
												defaultFormat={
													format.name === prefs.storyFormat.name &&
													format.version === prefs.storyFormat.version
												}
												editorExtensionsDisabled={prefs.disabledStoryFormatEditorExtensions.some(
													disabledFormat =>
														format.name === disabledFormat.name &&
														format.version === disabledFormat.version
												)}
												format={format}
												onSelect={() => handleSelect(format)}
												proofingFormat={
													format.name === prefs.proofingFormat.name &&
													format.version === prefs.proofingFormat.version
												}
											/>
										</CSSTransition>
									))}
								</TransitionGroup>
							</CardGroup>
						</FormatLoader>
					</MainContent>
				</ClickAwayListener>
			</DialogsContextProvider>
		</div>
	);
};
