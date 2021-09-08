import CodeMirror from 'codemirror';
import * as React from 'react';
import {version as twineVersion} from '../../package.json';
import {formatEditorExtensions, namespaceForFormat} from '../util/story-format';
import {formatEditorExtensionsDisabled, usePrefsContext} from './prefs';
import {
	formatWithNameAndVersion,
	loadFormatProperties,
	StoryFormatToolbarFactory,
	StoryFormatToolbarFactoryEnvironment,
	StoryFormatToolbarItem,
	useStoryFormatsContext
} from './story-formats';

/**
 * Manages working with a CodeMirror toolbar for a story format, which consists
 * of:
 *
 * - (optionally, but usually) a set of CodeMirror commands
 * - A function that returns an array of objects describing the toolbar, which
 *   uses those commands for functionality
 *
 * This loads the story format if it hasn't already been loaded, and installs
 * CodeMirror commands it provides. It returns the toolbar factory function if
 * everything succeeds. Otherwise, it will return undefined.
 */
export function useFormatCodeMirrorToolbar(
	formatName: string,
	formatVersion: string
) {
	const {dispatch, formats} = useStoryFormatsContext();
	const [loaded, setLoaded] = React.useState<Record<string, boolean>>({});
	const [
		toolbarFunc,
		setToolbarFunc
	] = React.useState<StoryFormatToolbarFactory>();
	const format = formatWithNameAndVersion(formats, formatName, formatVersion);
	const {prefs} = usePrefsContext();
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
		} else if (
			format.loadState === 'loaded' &&
			!loaded[namespaceForFormat(format)]
		) {
			const namespace = namespaceForFormat(format);
			const editorExtensions = formatEditorExtensions(format, twineVersion);

			if (editorExtensions?.codeMirror?.commands) {
				for (const commandName in editorExtensions.codeMirror.commands) {
					const namespacedCommand = namespace + commandName;

					if (namespacedCommand in CodeMirror.commands) {
						console.warn(
							`CodeMirror already has a "${namespacedCommand}" command defined, skipping`
						);
					} else {
						// Using any here because the type is defined with factory
						// commands only.

						(CodeMirror.commands as any)[
							namespacedCommand
						] = editorExtensions.codeMirror!.commands![commandName];
					}
				}
			}

			if (editorExtensions?.codeMirror?.toolbar) {
				setToolbarFunc(
					() => (
						editor: CodeMirror.Editor,
						environment: StoryFormatToolbarFactoryEnvironment
					) => {
						// If somehow we lost our format's toolbar function, exit early.

						if (!editorExtensions?.codeMirror?.toolbar) {
							return [];
						}

						const items = editorExtensions.codeMirror.toolbar(
							editor,
							environment
						);

						// If we didn't get an array from the function, coerce it to an
						// empty one.

						if (!Array.isArray(items)) {
							return [];
						}

						// Namespace command properties and filter out any types that aren't
						// buttons or menus.

						return items.reduce((result, item) => {
							switch (item.type) {
								case 'button':
									return [
										...result,
										{...item, command: namespace + item.command}
									];

								case 'menu':
									if (Array.isArray(item.items)) {
										return [
											...result,
											{
												...item,
												items: item.items
													.filter(subitem =>
														['button', 'separator'].includes(subitem.type)
													)
													.map(subitem =>
														subitem.type === 'separator'
															? subitem
															: {
																	...subitem,
																	command: namespace + subitem.command
															  }
													)
											}
										];
									}
							}

							return result;
						}, [] as StoryFormatToolbarItem[]);
					}
				);
			}

			setLoaded(loaded => ({...loaded, [namespaceForFormat(format)]: true}));
		}
	}, [dispatch, extensionsDisabled, format, loaded]);

	return toolbarFunc;
}
