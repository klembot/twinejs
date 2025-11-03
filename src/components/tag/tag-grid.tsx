import * as React from 'react';
import {TagColors} from '../../store/stories';
import './tag-grid.css';
import classNames from 'classnames';

export interface TagGridProps {
	tagColors: TagColors;
	tags: string[];
}

export const TagGrid: React.FC<TagGridProps> = React.memo(props => {
	const tags = props.tags.filter(tag => tag in props.tagColors);
	let rows = [];

	// If there are 2 or fewer tags, put them each in a row by themselves.
	// If there are more, split them into rows of two.

	if (tags.length > 2) {
		while (tags.length > 2) {
			rows.push(tags.splice(0, 2));
		}

		rows.push(tags);
	} else {
		rows = tags.map(tag => [tag]);
	}

	return (
		<div className={classNames('tag-grid', {hidden: rows.length === 0})}>
			{rows.map((row, index) => (
				<span className="row" key={index}>
					{row.map(tag => (
						<span
							className={`color-${props.tagColors[tag]}`}
							key={tag}
							title={tag}
						/>
					))}
				</span>
			))}
		</div>
	);
});
