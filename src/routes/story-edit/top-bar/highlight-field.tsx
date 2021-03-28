import * as React from 'react';
import {TextInput} from '../../../components/control/text-input';
import {
	highlightPassagesWithText,
	useStoriesContext,
	Story
} from '../../../store/stories';

export interface HighlightFieldProps {
	story: Story;
}

export const HighlightField: React.FC<HighlightFieldProps> = props => {
	const {story} = props;
	const [highlightText, setHighlightText] = React.useState('');
	const {dispatch} = useStoriesContext();

	React.useEffect(() => {
		highlightPassagesWithText(dispatch, story, highlightText);
	}, [dispatch, highlightText, story]);

	return (
		<TextInput
			onChange={e => setHighlightText(e.target.value)}
			type="search"
			value={highlightText}
		/>
	);
};
