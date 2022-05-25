import {version as twineVersion} from '../../../../package.json';
import {dialog, shell} from 'electron';
import nodeFetch from 'node-fetch';
import {checkForUpdate} from '../check-for-update';

jest.mock('electron');
jest.mock('node-fetch');

describe('checkForUpdate()', () => {
	const nodeFetchMock = nodeFetch as unknown as jest.Mock;
	const openExternalMock = shell.openExternal as jest.Mock;
	const showErrorBoxMock = dialog.showErrorBox as jest.Mock;
	const showMessageBoxMock = dialog.showMessageBox as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
	});

	describe('if the newest version is older than the current one', () => {
		beforeEach(() => {
			nodeFetchMock.mockReturnValue({
				json: () => ({url: 'mock-url', version: '0.0.0'})
			});
		});

		it('shows a dialog saying that the user has the most current version', async () => {
			await checkForUpdate();
			expect(showMessageBoxMock.mock.calls).toEqual([
				[expect.objectContaining({message: 'electron.updateCheck.upToDate'})]
			]);
		});
	});

	describe('if the newest version is the same version as the current one', () => {
		beforeEach(() => {
			nodeFetchMock.mockReturnValue({
				json: () => ({url: 'mock-url', version: twineVersion})
			});
		});

		it('shows a dialog saying that the user has the most current version', async () => {
			await checkForUpdate();
			expect(showMessageBoxMock.mock.calls).toEqual([
				[expect.objectContaining({message: 'electron.updateCheck.upToDate'})]
			]);
		});
	});

	describe('if the newest version is newer than the current one', () => {
		beforeEach(() => {
			nodeFetchMock.mockReturnValue({
				json: () => ({url: 'mock-url', version: '999.0.0'})
			});
		});

		it('shows a dialog saying a newer version is available', async () => {
			await checkForUpdate();
			expect(showMessageBoxMock.mock.calls).toEqual([
				[
					expect.objectContaining({
						buttons: ['electron.updateCheck.download', 'common.cancel'],
						defaultId: 0,
						icon: 'info',
						message: 'electron.updateCheck.updateAvailable'
					})
				]
			]);
		});

		it('opens the download URL if the user clicks the Download button', async () => {
			showMessageBoxMock.mockResolvedValue({response: 0});
			await checkForUpdate();
			expect(openExternalMock.mock.calls).toEqual([['mock-url']]);
		});

		it('takes no action if the user clicks Cancel', async () => {
			showMessageBoxMock.mockResolvedValue({response: 1});
			await checkForUpdate();
			expect(openExternalMock).not.toBeCalled();
		});
	});

	describe('if the update check response is not JSON', () => {
		beforeEach(() => {
			nodeFetchMock.mockReturnValue({
				json: () => {
					throw new Error('mock JSON error');
				}
			});
		});

		it('shows an error dialog', async () => {
			await checkForUpdate();
			expect(showErrorBoxMock.mock.calls).toEqual([
				['electron.updateCheck.error', 'mock JSON error']
			]);
		});
	});

	describe('if the update check response has no version property', () => {
		beforeEach(() => {
			nodeFetchMock.mockReturnValue({
				json: () => ({})
			});
		});

		it('shows an error dialog', async () => {
			await checkForUpdate();
			expect(showErrorBoxMock.mock.calls).toEqual([
				['electron.updateCheck.error', 'Invalid Version: undefined']
			]);
		});
	});

	describe('if there is an error retrieving the newest version', () => {
		beforeEach(() => {
			nodeFetchMock.mockRejectedValue(new Error('mock error'));
		});

		it('shows an error dialog', async () => {
			await checkForUpdate();
			expect(showErrorBoxMock.mock.calls).toEqual([
				['electron.updateCheck.error', 'mock error']
			]);
		});
	});
});
