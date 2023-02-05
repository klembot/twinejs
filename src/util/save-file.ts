import {saveAs} from 'file-saver';

/**
 * Saves text to an HTML file. This works in either a browser or Electron
 * context.
 */
export function saveHtml(source: string, filename: string) {
	const data = new Blob([source], {type: 'text/html;charset=utf-8'});

	saveAs(data, filename);
}

/**
 * Saves text to a Twee file. This works in either a browser or Electron
 * context.
 */
export function saveTwee(source: string, filename: string) {
	const data = new Blob([source], {type: 'text/plain;charset=utf-8'});

	saveAs(data, filename);
}
