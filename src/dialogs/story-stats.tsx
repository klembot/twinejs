import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogCard} from '../components/container/dialog-card';
import {storyStats, storyWithId, useStoriesContext} from '../store/stories';
import {DialogComponentProps} from './dialogs.types';
import './story-stats.css';

const dateFormatter = new Intl.DateTimeFormat([], {
	dateStyle: 'full',
	timeStyle: 'long'
});

export interface StoryStatsDialogProps extends DialogComponentProps {
	storyId: string;
}

export const StoryStatsDialog: React.FC<StoryStatsDialogProps> = props => {
	const {storyId, ...other} = props;
	const {t} = useTranslation();
	const {stories} = useStoriesContext();

	const story = storyWithId(stories, storyId);
	let content: React.ReactNode = null;

	// Only calculate stats if the dialog is expanded.

	if (!other.collapsed) {
		const stats = storyStats(story);

		content = (
			<>
				<p>
					{t('storyStats.lastUpdate', {
						date: dateFormatter.format(story.lastUpdate)
					})}
				</p>
				<p>
					{t('storyStats.ifid', {ifid: story.ifid})}&nbsp;
					<a href="https://ifdb.org/help-ifid" target="_blank" rel="noreferrer">
						{t('storyStats.ifidExplanation')}
					</a>
				</p>
				<table className="counts">
					<tbody>
						<tr>
							<td>{stats.characters}</td>
							<td>{t('storyStats.characters')}</td>
						</tr>
						<tr>
							<td>{stats.words}</td>
							<td>{t('storyStats.words')}</td>
						</tr>
						<tr>
							<td>{stats.passages}</td>
							<td>{t('storyStats.passages')}</td>
						</tr>
						<tr>
							<td>{stats.links.length}</td>
							<td>{t('storyStats.links')}</td>
						</tr>
						<tr>
							<td>{stats.brokenLinks.length}</td>
							<td>{t('storyStats.brokenLinks')}</td>
						</tr>
					</tbody>
				</table>
			</>
		);
	}

	return (
		<DialogCard
			{...other}
			className="story-stats-dialog"
			fixedSize
			headerLabel={t('storyStats.title')}
		>
			<div className="content">{content}</div>
		</DialogCard>
	);
};
