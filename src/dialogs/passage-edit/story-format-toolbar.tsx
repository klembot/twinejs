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
	storyFormat: StoryFormat;
}

export const StoryFormatToolbar: React.FC<StoryFormatToolbarProps> = props => {
	const {editor, storyFormat} = props;
	const appTheme = useComputedTheme();
	const {prefs} = usePrefsContext();
	const toolbarFactory = useFormatCodeMirrorToolbar(
		storyFormat.name,
		storyFormat.version
	);
	const [toolbarItems, setToolbarItems] = React.useState<
		StoryFormatToolbarItem[]
	>([]);

	React.useEffect(() => {
		if (toolbarFactory && editor) {
			try {
				setToolbarItems(
					toolbarFactory(editor, {
						appTheme,
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

	return (
		<div className="story-format-toolbar">
			<ButtonBar>
				{toolbarItems.map((item, index) => {
					switch (item.type) {
						case 'button':
							return (
								<IconButton
									disabled={item.disabled}
									icon={<img src={item.icon} alt="" />}
									key={index}
									label={item.label}
									onClick={() => editor?.execCommand(item.command)}
								/>
							);

						case 'menu': {
							return (
								<MenuButton
									disabled={item.disabled}
									icon={<img src={item.icon} alt="" />}
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
													onClick: () => editor?.execCommand(subitem.command)
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
