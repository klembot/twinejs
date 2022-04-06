import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {storyStats, Story} from '../../store/stories';
import './story-stats.css';

const dateFormatter = new Intl.DateTimeFormat([], {
	dateStyle: 'full',
	timeStyle: 'long'
});

export interface StoryDetailsDialogStatsProps {
	story: Story;
}

export const StoryDetailsDialogStats: React.FC<StoryDetailsDialogStatsProps> = props => {
	const {story} = props;
	const stats = storyStats(story);
	const {t} = useTranslation();

	return (
		<div className="story-stats">
			<table className="counts">
				<tbody>
					<tr>
						<td>{stats.characters}</td>
						<td>{t('dialogs.storyDetails.stats.characters')}</td>
					</tr>
					<tr>
						<td>{stats.words}</td>
						<td>{t('dialogs.storyDetails.stats.words')}</td>
					</tr>
					<tr>
						<td>{stats.passages}</td>
						<td>{t('dialogs.storyDetails.stats.passages')}</td>
					</tr>
					<tr>
						<td>{stats.links.length}</td>
						<td>{t('dialogs.storyDetails.stats.links')}</td>
					</tr>
					<tr>
						<td>{stats.brokenLinks.length}</td>
						<td>{t('dialogs.storyDetails.stats.brokenLinks')}</td>
					</tr>
				</tbody>
			</table>
			<div className="update-and-ifid">
				<p>
					{t('dialogs.storyDetails.stats.lastUpdate', {
						date: dateFormatter.format(story.lastUpdate)
					})}
				</p>
				<p>
					{t('dialogs.storyDetails.stats.ifid', {ifid: story.ifid})}&nbsp;
					<a href="https://ifdb.org/help-ifid" target="_blank" rel="noreferrer">
						{t('dialogs.storyDetails.stats.ifidExplanation')}
					</a>
				</p>
			</div>
		</div>
	);
};
