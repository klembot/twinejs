import * as React from 'react';
import {version as twineVersion} from '../../../package.json';
import {formatEditorExtensions} from '../../util/story-format';
import {formatWithNameAndVersion} from './getters';
import {useStoryFormatsContext} from './story-formats-context';
import {loadFormatProperties} from './action-creators';

export function useFormatReferenceParser(
	formatName: string,
	formatVersion: string
) {
	const {dispatch, formats} = useStoryFormatsContext();
	const format = formatWithNameAndVersion(formats, formatName, formatVersion);
	const [editorExtensions, setEditorExtensions] = React.useState<
		ReturnType<typeof formatEditorExtensions>
	>();

	React.useEffect(() => {
		if (format.loadState === 'unloaded') {
			dispatch(loadFormatProperties(format));
		} else if (format.loadState === 'loaded') {
			setEditorExtensions(formatEditorExtensions(format, twineVersion));
		}
	}, [dispatch, format]);

	return editorExtensions?.references?.parsePassageText ?? (() => []);
}
