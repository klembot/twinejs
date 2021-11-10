import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {storyStats, Story} from '../../store/stories';
import './story-stats.css';

const dateFormatter = new Intl.DateTimeFormat([], {
	dateStyle: 'full',
	timeStyle: 'long'
});

export interface StoryStatsDialogProps {
	story: Story;
}

export const StoryStatsDialog: React.FC<StoryStatsDialogProps> = props => {
	const {story} = props;
	const stats = storyStats(story);
	const {t} = useTranslation();

	return (
		<div className="story-stats">
			<table className="counts">
				<tbody>
					<tr>
						<td>{stats.characters}</td>
						<td>{t('dialogs.storyInfo.stats.characters')}</td>
					</tr>
					<tr>
						<td>{stats.words}</td>
						<td>{t('dialogs.storyInfo.stats.words')}</td>
					</tr>
					<tr>
						<td>{stats.passages}</td>
						<td>{t('dialogs.storyInfo.stats.passages')}</td>
					</tr>
					<tr>
						<td>{stats.links.length}</td>
						<td>{t('dialogs.storyInfo.stats.links')}</td>
					</tr>
					<tr>
						<td>{stats.brokenLinks.length}</td>
						<td>{t('dialogs.storyInfo.stats.brokenLinks')}</td>
					</tr>
				</tbody>
			</table>
			<div className="update-and-ifid">
				<p>
					{t('dialogs.storyInfo.stats.lastUpdate', {
						date: dateFormatter.format(story.lastUpdate)
					})}
				</p>
				<p>
					{t('dialogs.storyInfo.stats.ifid', {ifid: story.ifid})}&nbsp;
					<a href="https://ifdb.org/help-ifid" target="_blank" rel="noreferrer">
						{t('dialogs.storyInfo.stats.ifidExplanation')}
					</a>
				</p>
			</div>
		</div>
	);
};
