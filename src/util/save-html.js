/*
Helper function to save to a file. This works in either a browser or Electron context.
*/

import {saveAs} from 'file-saver';

export default function saveHtml(source, filename) {
	const data = new Blob([source], {type: 'text/html;charset=utf-8'});

	saveAs(data, filename);
}
