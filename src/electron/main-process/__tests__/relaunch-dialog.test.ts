import {app, dialog} from 'electron';
import {showRelaunchDialog} from '../relaunch-dialog';

jest.mock('electron');

describe('showRelaunchDialog', () => {
	const quitMock = app.quit as jest.Mock;
	const relaunchMock = app.relaunch as jest.Mock;
	const showMessageBoxMock = dialog.showMessageBox as jest.Mock;

	beforeEach(() => {
		showMessageBoxMock.mockResolvedValue({response: 0});
	});

	it('uses the default prompt if not specified', async () => {
		await showRelaunchDialog();
		expect(showMessageBoxMock.mock.calls).toEqual([
			[
				expect.objectContaining({
					message: 'electron.relaunchDialog.defaultPrompt'
				})
			]
		]);
	});

	it('uses a custom prompt if specified', async () => {
		await showRelaunchDialog('test-message');
		expect(showMessageBoxMock.mock.calls).toEqual([
			[
				expect.objectContaining({
					message: 'test-message'
				})
			]
		]);
	});

	it('shows an OK button and Relaunch Now button, and defaults the OK button', async () => {
		await showRelaunchDialog('test-message');
		expect(showMessageBoxMock.mock.calls).toEqual([
			[
				expect.objectContaining({
					buttons: ['common.ok', 'electron.relaunchDialog.relaunchNow'],
					defaultId: 0
				})
			]
		]);
	});

	it('relaunches the app if the Relaunch Now button is chosen', async () => {
		showMessageBoxMock.mockResolvedValue({response: 1});
		await showRelaunchDialog('test-message');
		expect(relaunchMock).toBeCalledTimes(1);
		expect(quitMock).toBeCalledTimes(1);
	});

	it('does nothing if the OK button is chosen', async () => {
		showMessageBoxMock.mockResolvedValue({response: 0});
		await showRelaunchDialog('test-message');
		expect(relaunchMock).not.toBeCalled();
		expect(quitMock).not.toBeCalled();
	});
});
