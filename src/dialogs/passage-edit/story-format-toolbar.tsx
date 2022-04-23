import * as React from 'react';
import CodeMirror from 'codemirror';
import {usePrefsContext} from '../../store/prefs';
import {StoryFormat, StoryFormatToolbarItem} from '../../store/story-formats';
import {useComputedTheme} from '../../store/prefs/use-computed-theme';
import {useFormatCodeMirrorToolbar} from '../../store/use-format-codemirror-toolbar';
import {ButtonBar} from '../../components/container/button-bar';
import {IconButton} from '../../components/control/icon-button';
import {MenuButton} from '../../components/control/menu-button';
import './story-format-toolbar.css';

export interface StoryFormatToolbarProps {
	editor?: CodeMirror.Editor;
	onExecCommand: (name: string) => void;
	storyFormat: StoryFormat;
}

export const StoryFormatToolbar: React.FC<StoryFormatToolbarProps> = props => {
	const {editor, onExecCommand, storyFormat} = props;
	const containerRef = React.useRef<HTMLDivElement>(null);
	const appTheme = useComputedTheme();
	const {prefs} = usePrefsContext();
	const toolbarFactory = useFormatCodeMirrorToolbar(
		storyFormat.name,
		storyFormat.version
	);
	const [toolbarItems, setToolbarItems] = React.useState<
		StoryFormatToolbarItem[]
	>([]);

	const tryToSetToolbar = React.useCallback(() => {
		if (toolbarFactory && containerRef.current && editor) {
			try {
				const style = window.getComputedStyle(containerRef.current);

				setToolbarItems(
					toolbarFactory(editor, {
						appTheme,
						foregroundColor: style.color,
						locale: prefs.locale
					})
				);
			} catch (error) {
				console.error(
					`Toolbar function for ${storyFormat.name} ${storyFormat.version} threw an error, skipping update`,
					error
				);
			}
		} else {
			setToolbarItems([]);
		}
	}, [
		appTheme,
		editor,
		prefs.locale,
		storyFormat.name,
		storyFormat.version,
		toolbarFactory
	]);

	React.useEffect(() => {
		if (editor) {
			// Run the toolbar factory initially.

			tryToSetToolbar();

			// React to both content changes and the selection and cursor moving,
			// since the toolbar factory might want to do different things based on
			// the cursor position or selection.

			editor.on('cursorActivity', tryToSetToolbar);
			return () => editor.off('cursorActivity', tryToSetToolbar);
		}
	}, [editor, tryToSetToolbar]);

	function execCommand(name: string) {
		// Run the command, then update the toolbar after the current execution
		// context finishes.

		onExecCommand(name);
		Promise.resolve().then(tryToSetToolbar);
	}

	return (
		<div className="story-format-toolbar" ref={containerRef}>
			<ButtonBar>
				{toolbarItems.map((item, index) => {
					switch (item.type) {
						case 'button':
							return (
								<IconButton
									disabled={item.disabled}
									icon={<img src={item.icon} alt="" />}
									iconOnly={item.iconOnly}
									key={index}
									label={item.label}
									onClick={() => execCommand(item.command)}
								/>
							);

						case 'menu': {
							return (
								<MenuButton
									disabled={item.disabled}
									icon={<img src={item.icon} alt="" />}
									iconOnly={item.iconOnly}
									items={item.items
										.filter(subitem =>
											['button', 'separator'].includes(subitem.type)
										)
										.map(subitem => {
											if (subitem.type === 'button') {
												return {
													type: 'button',
													disabled: subitem.disabled,
													label: subitem.label,
													onClick: () => execCommand(subitem.command)
												};
											}

											return {separator: true};
										})}
									key={index}
									label={item.label}
								/>
							);
						}
					}

					return null;
				})}
			</ButtonBar>
		</div>
	);
};
