import {version as twineVersion} from '../../../package.json';
import CodeMirror from 'codemirror';
import * as React from 'react';
import {
	formatWithNameAndVersion,
	loadFormatProperties,
	useStoryFormatsContext,
	StoryFormatToolbarFactory
} from '.';
import {
	formatEditorExtensions,
	namespaceForFormat
} from '../../util/story-format';
import {StoryFormatToolbarFactoryEnvironment} from './story-formats.types';

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

	React.useEffect(() => {
		if (format.loadState === 'unloaded') {
			dispatch(loadFormatProperties(format));
		} else if (
			format.loadState === 'loaded' &&
			!loaded[namespaceForFormat(format)]
		) {
			const namespace = namespaceForFormat(format);
			const editorExtensions = formatEditorExtensions(format, twineVersion);

			if (editorExtensions?.codeMirror?.commands) {
				Object.keys(editorExtensions.codeMirror.commands).forEach(
					commandName => {
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
				);
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

						return editorExtensions.codeMirror
							.toolbar(editor, environment)
							.map(item => {
								switch (item.type) {
									case 'button':
										return {...item, command: namespace + item.command};

									case 'menu':
										return {
											...item,
											items: item.items.map(subitem =>
												subitem.type === 'separator'
													? subitem
													: {
															...subitem,
															command: namespace + subitem.command
													  }
											)
										};

									default:
										// If we don't understand the item object, remove any command on it
										// so it's nonfunctional.

										console.warn(
											`Don't know how to handle a toolbar item of type "${
												(item as any).type
											}", skipping`
										);

										return {...(item as any), command: ''};
								}
							});
					}
				);
			}

			setLoaded(loaded => ({...loaded, [namespaceForFormat(format)]: true}));
		}
	}, [dispatch, format, loaded]);

	return toolbarFunc;
}
