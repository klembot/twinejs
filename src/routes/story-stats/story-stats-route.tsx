import * as React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../components/control/icon-button';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {storyStats, storyWithId, useStoriesContext} from '../../store/stories';

const dateFormatter = new Intl.DateTimeFormat([], {
	dateStyle: 'full',
	timeStyle: 'long'
});

export const StoryStatsRoute: React.FC = () => {
	const history = useHistory();
	const {stories} = useStoriesContext();
	const {storyId} = useParams<{storyId: string}>();
	const story = storyWithId(stories, storyId);
	const stats = storyStats(story);
	const {t} = useTranslation();

	return (
		<div className="story-stats-route">
			<TopBar>
				<IconButton
					icon="arrow-left"
					label={story.name}
					onClick={() => history.push(`/stories/${story.id}`)}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('storyStats.title')}</h1>
				<p>
					{t('storyStats.lastUpdate', {
						date: dateFormatter.format(story.lastUpdate)
					})}
				</p>
				<p>
					{t('storyStats.ifid', {ifid: story.ifid})}&nbsp;
					<a
						href="https://ifdb.org/help-ifid"
						target="_blank"
						rel="noreferrer"
					>
						{t('storyStats.ifidExplanation')}
					</a>
				</p>
				<table>
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
			</MainContent>
		</div>
	);
};
