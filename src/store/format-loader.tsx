// Initiates story format loading, optionally showing a progress meter while it works.

import * as React from 'react';
import {Meter} from '../components/meter';
import {
	loadAllFormatProperties,
	useStoryFormatsContext,
	StoryFormat
} from './story-formats';

export interface FormatLoaderProps {
	block?: boolean;
}

export const FormatLoader: React.FC<FormatLoaderProps> = ({
	block,
	children
}) => {
	const [toLoad, setToLoad] = React.useState<StoryFormat[]>([]);
	const {dispatch, formats} = useStoryFormatsContext();

	// We can't directly use formats in an effect because it will change as
	// loading takes place. Instead, we need to maintain a list of formats to load
	// that only ever changes if new formats appear in state.

	React.useEffect(() => {
		setToLoad(oldToLoad => {
			const newFormats: StoryFormat[] = formats.filter(
				newFormat =>
					!oldToLoad.find(
						oldFormat =>
							oldFormat.name === newFormat.name &&
							oldFormat.version === newFormat.version
					)
			);

			if (newFormats.length > 0) {
				return [...oldToLoad, ...newFormats];
			}

			return oldToLoad;
		});
	}, [formats]);

	React.useEffect(() => {
		dispatch(loadAllFormatProperties(toLoad));
	}, [dispatch, toLoad]);

	const loadingFormat = formats.find(f => f.loadState === 'loading');
	const loadPercent =
		formats.filter(f => f.loadState === 'loaded').length / formats.length;

	if (block && loadPercent < 1) {
		return (
			<Meter percent={loadPercent}>
				{loadingFormat && (
					<>
						Loading {loadingFormat.name} {loadingFormat.version}
					</>
				)}
			</Meter>
		);
	}

	return <>{children}</>;
};
