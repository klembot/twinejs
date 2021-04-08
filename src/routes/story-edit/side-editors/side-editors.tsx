import * as React from 'react';
import {useScrollbarSize} from 'react-scrollbar-size';
import {useEditorsContext} from './editors-context';
import {PassageEditorCard} from './passage-editor-card';
import {Story} from '../../../store/stories';
import './side-editors.css';

export interface SideEditorsProps {
	story: Story;
}

export const SideEditors: React.FC<SideEditorsProps> = props => {
	const {story} = props;
	const {height, width} = useScrollbarSize();
	const {dispatch, editors} = useEditorsContext();

	if (editors.length === 0) {
		return null;
	}

	const style = {
		marginBottom: height,
		marginRight: width
	};

	return (
		<div className="side-editors" style={style}>
			{editors.map((props, index) => (
				<PassageEditorCard
					{...props}
					key={props.passageId}
					onChangeCollapsed={(collapsed: boolean) =>
						dispatch({type: 'setEditorCollapsed', collapsed, index})
					}
					onClose={() => dispatch({type: 'removeEditor', index})}
					story={story}
				/>
			))}
		</div>
	);
};
