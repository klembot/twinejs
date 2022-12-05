import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Story} from '../../../../../store/stories';
import {FakeStateProvider, fakeStory} from '../../../../../test-util';
import {getAppInfo} from '../../../../../util/app-info';
import {archiveFilename, publishArchive} from '../../../../../util/publish';
import {saveHtml} from '../../../../../util/save-file';
import {ArchiveButton} from '../archive-button';

jest.mock('../../../../../util/save-file');

describe('ArchiveButton', () => {
	const saveHtmlMock = saveHtml as jest.Mock;

	function renderComponent(stories?: Story[]) {
		return render(
			<FakeStateProvider stories={stories}>
				<ArchiveButton />
			</FakeStateProvider>
		);
	}

	it('saves an HTML archive of all stories when clicked', () => {
		const stories = [fakeStory(), fakeStory()];
		renderComponent(stories);
		fireEvent.click(screen.getByText('routes.storyList.toolbar.archive'));
		expect(saveHtmlMock.mock.calls).toEqual([
			[publishArchive(stories, getAppInfo()), archiveFilename()]
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
