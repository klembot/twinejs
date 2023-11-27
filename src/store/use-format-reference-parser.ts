import * as React from 'react';
import {formatEditorExtensions} from '../util/story-format';
import {
	formatWithNameAndVersion,
	loadFormatProperties,
	useStoryFormatsContext
} from './story-formats';
import {formatEditorExtensionsDisabled, usePrefsContext} from './prefs';
import {getAppInfo} from '../util/app-info';

const emptyFunc = () => [];

export function useFormatReferenceParser(
	formatName: string,
	formatVersion: string
) {
	const {prefs} = usePrefsContext();
	const {dispatch, formats} = useStoryFormatsContext();
	const format = formatWithNameAndVersion(formats, formatName, formatVersion);
	const [editorExtensions, setEditorExtensions] =
		React.useState<ReturnType<typeof formatEditorExtensions>>();
	const extensionsDisabled = formatEditorExtensionsDisabled(
		prefs,
		formatName,
		formatVersion
	);

	React.useEffect(() => {
		if (extensionsDisabled) {
			return;
		}

		if (format.loadState === 'unloaded') {
			dispatch(loadFormatProperties(format));
		} else if (format.loadState === 'loaded') {
			setEditorExtensions(formatEditorExtensions(format, getAppInfo().version));
		}
	}, [dispatch, extensionsDisabled, format]);

	if (extensionsDisabled) {
		return emptyFunc;
	}

	return editorExtensions?.references?.parsePassageText ?? emptyFunc;
}
