import {saveHtml} from '../save-file';
import {saveAs} from 'file-saver';

jest.mock('file-saver');

describe('saveHtml()', () => {
	const saveAsMock = jest.mocked(saveAs);

	it('calls saveAs with an HTML blob', async () => {
		saveHtml('test html', 'test filename.html');

		const call = saveAsMock.mock.calls[0];

		expect(call[0] instanceof Blob).toBe(true);
		expect((call[0] as Blob).type).toBe('text/html;charset=utf-8');

		// It seems like we're missing the text() method here in the testing context.

		expect(call[1]).toBe('test filename.html');
	});
});
