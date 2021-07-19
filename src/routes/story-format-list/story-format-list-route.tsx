import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconArrowLeft, IconFilter} from '@tabler/icons';
import {CardGroup} from '../../components/container/card-group';
import {MainContent} from '../../components/container/main-content';
import {MenuButton} from '../../components/control/menu-button';
import {TopBar} from '../../components/container/top-bar';
import {IconButton} from '../../components/control/icon-button';
import {AddStoryFormatButton} from '../../components/story-format/add-story-format-button';
import {StoryFormatCard} from '../../components/story-format/story-format-card/story-format-card';
import {FormatLoader} from '../../store/format-loader';
import {PrefsState, setPref, usePrefsContext} from '../../store/prefs';
import {
	createFromProperties,
	filteredFormats,
	sortFormats,
	useStoryFormatsContext,
	StoryFormat,
	StoryFormatProperties,
	deleteFormat
} from '../../store/story-formats';

export const StoryFormatListRoute: React.FC = () => {
	const {dispatch: formatsDispatch, formats} = useStoryFormatsContext();
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const history = useHistory();
	const {t} = useTranslation();

	function handleAddFormat(
		formatUrl: string,
		properties: StoryFormatProperties
	) {
		formatsDispatch(createFromProperties(formatUrl, properties));
	}

	function handleChangeFilter(value: PrefsState['storyFormatListFilter']) {
		prefsDispatch({type: 'update', name: 'storyFormatListFilter', value});
	}

	function handleDeleteFormat(format: StoryFormat) {
		formatsDispatch(deleteFormat(format));
	}

	function handleSelect(format: StoryFormat) {
		if (format.loadState !== 'loaded') {
			throw new Error("Can't select an unloaded format");
		}

		if (format.properties.proofing) {
			prefsDispatch(
				setPref('proofingFormat', {
					name: format.name,
					version: format.version
				})
			);
		} else {
			prefsDispatch(
				setPref('storyFormat', {
					name: format.name,
					version: format.version
				})
			);
		}
	}

	const visibleFormats = sortFormats(
		filteredFormats(formats, prefs.storyFormatListFilter)
	);

	return (
		<div className="story-format-list-route">
			<TopBar>
				<IconButton
					icon={<IconArrowLeft />}
					onClick={() => history.push('/')}
					label={t('routes.storyList.titleGeneric')}
					variant="primary"
				/>
				<MenuButton
					icon={<IconFilter />}
					items={[
						{
							checked: prefs.storyFormatListFilter === 'current',
							label: t('routes.storyFormatList.title.current'),
							onClick: () => handleChangeFilter('current')
						},
						{
							checked: prefs.storyFormatListFilter === 'user',
							label: t('routes.storyFormatList.title.user'),
							onClick: () => handleChangeFilter('user')
						},
						{
							checked: prefs.storyFormatListFilter === 'all',
							label: t('routes.storyFormatList.title.all'),
							onClick: () => handleChangeFilter('all')
						}
					]}
					label={t('routes.storyFormatList.show')}
				/>
				<AddStoryFormatButton
					existingFormats={formats}
					onAddFormat={handleAddFormat}
				/>
			</TopBar>
			<MainContent
				title={t(`routes.storyFormatList.title.${prefs.storyFormatListFilter}`)}
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
						{visibleFormats.map(format => (
							<StoryFormatCard
								format={format}
								key={format.id}
								onDelete={() => handleDeleteFormat(format)}
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
