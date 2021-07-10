import {saveAs} from 'file-saver';

/**
 * Saves text to a file. This works in either a browser or Electron context.
 */
export function saveHtml(source: string, filename: string) {
	const data = new Blob([source], {type: 'text/html;charset=utf-8'});

	saveAs(data, filename);
}
