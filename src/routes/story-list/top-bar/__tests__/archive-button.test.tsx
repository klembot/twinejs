import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	StoriesContext,
	StoriesContextProps,
	Story
} from '../../../../store/stories';
import {fakeStory} from '../../../../test-util';
import {getAppInfo} from '../../../../util/app-info';
import {archiveFilename, publishArchive} from '../../../../util/publish';
import {saveHtml} from '../../../../util/save-html';
import {ArchiveButton} from '../archive-button';

jest.mock('../../../../util/app-info');
jest.mock('../../../../util/publish');
jest.mock('../../../../util/save-html');

describe('<ArchiveButton>', () => {
	const archiveFilenameMock = archiveFilename as jest.Mock;
	const getAppInfoMock = getAppInfo as jest.Mock;
	const publishArchiveMock = publishArchive as jest.Mock;
	const saveHtmlMock = saveHtml as jest.Mock;

	function renderComponent(context?: Partial<StoriesContextProps>) {
		return render(
			<StoriesContext.Provider
				value={{dispatch: jest.fn(), stories: [], ...context}}
			>
				<ArchiveButton />
			</StoriesContext.Provider>
		);
	}

	it('displays a button which saves an archive of all stories when clicked', () => {
		const stories: Story[] = [fakeStory()];

		archiveFilenameMock.mockReturnValue('mock-archive-filename.html');
		getAppInfoMock.mockReturnValue({mockAppInfo: true});
		publishArchiveMock.mockReturnValue({mockArchive: true});
		renderComponent({stories});
		expect(saveHtmlMock).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button'));
		expect(publishArchiveMock.mock.calls).toEqual([
			[stories, {mockAppInfo: true}]
		]);
		expect(saveHtmlMock.mock.calls).toEqual([
			[{mockArchive: true}, 'mock-archive-filename.html']
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
