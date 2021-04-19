import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {CardGroup} from '../../components/container/card-group';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {IconButton} from '../../components/control/icon-button';
import {StoryFormatCard} from '../../components/story-format/story-format-card/story-format-card';
import {FormatLoader} from '../../store/format-loader';
import {setPref, usePrefsContext} from '../../store/prefs';
import {
	sortFormats,
	useStoryFormatsContext,
	StoryFormat
} from '../../store/story-formats';

// TODO: add story format functionality
// TODO: filter button (current, outdated, proofing, regular, user-added)

export const StoryFormatListRoute: React.FC = () => {
	const {formats} = useStoryFormatsContext();
	const {dispatch, prefs} = usePrefsContext();
	const history = useHistory();
	const {t} = useTranslation();

	function handleSelect(format: StoryFormat) {
		if (format.loadState !== 'loaded') {
			throw new Error("Can't select an unloaded format");
		}

		if (format.properties.proofing) {
			dispatch(
				setPref('proofingFormat', {
					name: format.name,
					version: format.version
				})
			);
		} else {
			dispatch(
				setPref('storyFormat', {
					name: format.name,
					version: format.version
				})
			);
		}
	}

	return (
		<div className="story-format-list-route">
			<TopBar>
				<IconButton
					icon="arrow-left"
					onClick={() => history.push('/')}
					label={t('storyList.title')}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('storyFormatList.storyFormats')}</h1>
				<FormatLoader>
					<CardGroup columnWidth="450px">
						{sortFormats(formats).map(format => (
							<StoryFormatCard
								format={format}
								key={format.id}
								onDelete={() => {}}
								onSelect={() => handleSelect(format)}
								selected={
									(format.name === prefs.storyFormat.name &&
										format.version === prefs.storyFormat.version) ||
									(format.name === prefs.proofingFormat.name &&
										format.version === prefs.proofingFormat.version)
								}
							/>
						))}
					</CardGroup>
				</FormatLoader>
			</MainContent>
		</div>
	);
};
